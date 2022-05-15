const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.post("/getOpenPoReceivingDetail", async (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlPoStr = `SELECT 
    Company_name_ch,
    VendorID,
    poID,
    PoDate,
    "" AS vendorInvoice,
    Currency
     FROM po_db.po AS po
    JOIN master_db.supplier as supplier ON supplier.ID = po.vendorID
    WHERE po.poID=${param.poID}`;

  // const sqlStrPoDetail = `SELECT * FROM master_db.product as pro
  // JOIN (SELECT * FROM po_db.po_detail AS pd where pd.poID =${param.poID})as a  where pro.ID = a.ProductID `;

  const sqlStrPoDetail = `SELECT 
  poDetail.ProductID,
  poDetail.ID AS PoItemIndex,
  PartNumber,
  poDetail.BurnOption,
  poDetail.QTY AS "PoQTY",
  poDetail.UnitCost,
  "" as ReceiveDate, 
  CAST(poDetail.QTY - IFNULL(SUM(receiving_document.ReceiveQTY),0) AS DOUBLE) as OpenQTY,
  ""as Remark,
  Json_Array() as ReceiveItems
   FROM po_db.po AS po
  LEFT JOIN po_db.po_detail as poDetail ON  PO.poID = poDetail.poID
  LEFT JOIN po_db.receiving_document as receiving_document ON  poDetail.ID = receiving_document.PoItemIndex
  LEFT JOIN master_db.product as pro ON  poDetail.ProductID =pro.ProductID
  LEFT JOIN master_db.supplier as supplier ON supplier.ID = po.vendorID
  WHERE po.poID=${param.poID}
  GROUP BY (poDetail.ID)`;

  const promisePool = db.promise();
  const customer = promisePool.query(sqlPoStr);
  const podetail = promisePool.query(sqlStrPoDetail);

  Promise.all([customer, podetail]).then((results) => {
    const poInfo = { ...results[0][0][0], orderProduct: results[1][0] };
    console.log(poInfo);
    res.status(200).json(poInfo);
  });
});

router.post("/insertReceiveDocument", (req, res) => {
  const data = req.body;
  console.log(JSON.stringify(data, null, 4));

  let newJSON = [];
  data.orderProduct.map((product, productIndex) => {
    product.ReceiveItems.map((receiveItem, itemIndex) => {
      const newOBJ = {
        PoNumber: data.poID,
        PoItemIndex: product.PoItemIndex,
        ProductID: product.ProductID,
        ReceiveDate: product.ReceiveDate,
        ReceiveQTY: receiveItem.ReceiveQTY,
        Remark: product.Remark,
        UnitCost: product.UnitCost,
        VendorInvoiceNumber: data.vendorInvoice,
        CodeVersion: receiveItem.CodeVersion,
        Location: receiveItem.Location,
        LotNumber: receiveItem.Lot,
        BurnOption: product.BurnOption,
        DateCode: receiveItem.DateCode,
      };
      newJSON.push(newOBJ);
    });
  });

  console.log(newJSON);

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      const receiveDetailkeys = Object.keys(newJSON[0]);
      const insertReceiveValue = newJSON.map((receiveObj, index) =>
        Object.values(receiveObj)
      );

      // insert to po_db.receive_document table for the receiving items

      connection.query(
        `INSERT INTO po_db.receiving_document (${receiveDetailkeys.toString()}) VALUES ?`,
        [insertReceiveValue],
        function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }

          // get open qty status by Po# to update poDetail status and Po status
          const sqlPoReceivingStatus = `SELECT 
                                        poDetail.poID,
                                        poDetail.QTY,
                                        poDetail.ID AS PoItemIndex,
                                        cast(IFNULL(SUM(receiving_document.ReceiveQTY),0) as double) as "ReceiveQTY"
                                        FROM po_db.po_detail as poDetail 
                                        JOIN po_db.receiving_document as receiving_document ON  poDetail.ID = receiving_document.PoItemIndex
                                        WHERE poDetail.poID=${data.poID}
                                        GROUP BY (poDetail.ID)`;

          connection.query(
            sqlPoReceivingStatus,
            function (error, result_receiveStatus, fields) {
              if (error) {
                return connection.rollback(function () {
                  connection.release();
                  res.status(500).send(error);
                  throw error;
                });
              }

              const poStatusIsOpen = [];
              const poStatusIsComplete = [];
              let poStatus = "open";

              result_receiveStatus.map((poItem, index) => {
                console.log(poItem);
                const openQTY = poItem.QTY - poItem.ReceiveQTY;

                let itemReceiveStatus = "open";

                if (openQTY === 0) {
                  itemReceiveStatus = "completed";
                  poStatusIsComplete.push("completed");
                } else if (poItem.ReceiveQTY > 0) {
                  itemReceiveStatus = "partial";
                  poStatus = "partial";
                } else {
                  poStatusIsOpen.push("open");
                }

                // change po_detail table status
                connection.query(
                  `UPDATE po_db.po_detail SET ReceiveStatus="${itemReceiveStatus}" WHERE ID= ${poItem.PoItemIndex}`,
                  function (error, result, fields) {
                    console.log(result);
                    if (error) {
                      console.log(error);
                      return connection.rollback(function () {
                        connection.release();
                        res.status(500).send(error);
                        throw error;
                      });
                    }
                  }
                );
              });

              if (poStatusIsOpen.length == result_receiveStatus.length) {
                poStatus = "open";
              } else if (
                poStatusIsComplete.length == result_receiveStatus.length
              ) {
                poStatus = "completed";
              }

              connection.query(
                `UPDATE po_db.po SET Status="${poStatus}" WHERE poID= ${data.poID}`,
                function (error, result, fields) {
                  if (error) {
                    return connection.rollback(function () {
                      connection.release();
                      res.status(500).send(error);
                      throw error;
                    });
                  }

                  connection.commit(function (err) {
                    if (err) {
                      return connection.rollback(function () {
                        connection.release();
                        res.status(500).send(err);
                        throw err;
                      });
                    } else {
                      connection.release();
                      res
                        .status(200)
                        .json({ data: "Items are inserted into inventory" });
                      console.log("success!");
                    }
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

module.exports = router;
