const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.post("/createPo", (req, res) => {
  const values = req.body;
  const PoInfo = {
    VendorID: values.ID,
    ContactPerson: values.ContactPerson,
    Currency: values.Currency,
    poDate: values.PoDate,
    Remark: values.Remark,
    Status: "open",
  };

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      const PoDetailkeys = Object.keys(PoInfo);
      const PoDetailValue = Object.values(PoInfo);
      connection.query(
        `INSERT INTO po_db.po (${PoDetailkeys.toString()}) VALUES(?)`,
        [PoDetailValue],
        function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }

          const insertPoID = results.insertId;
          const podetailKeys = `(poID,Application,BurnOption,ETD,Packaging,ProductID,QTY,UnitCost,CustomerID,Remark)`;

          const poDetail = values.orderProduct.map((product, index) => [
            insertPoID,
            product.Application.value,
            product.BurnOption.value,
            product.ETD,
            product.Packaging.value,
            product.product.ID,
            product.QTY,
            product.UnitCost,
            product.customer.ID,
            product.remark,
          ]);
          console.log(poDetail);

          connection.query(
            `INSERT INTO po_db.po_detail ${podetailKeys} VALUES ?`,
            [poDetail],
            function (error, results, fields) {
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
                  res.status(200).json({ data: insertPoID });
                  console.log("success!");
                }
              });
            }
          );
        }
      );
    });
  });
});

router.get("/getListOpenPo", (req, res) => {
  const sqlStr = `SELECT p.poID as "id" , DATE_FORMAT(p.poDate, "%Y.%M.%d" ) as "Po Date",p.VendorId as "Vendor ID", s.Company_name_ch as "Company Name", p.Remark,sum(pd.QTY * pd.UnitCost) as "Total cost" , p.Status as Status
  FROM po_db.po AS p 
  left join master_db.supplier as s on  p.vendorId = s.ID
  left join po_db.po_detail as pd on p.poID= pd.poID 
  where p.status in ("open","partial") 
  group by p.poID`;

  db.query(sqlStr, function (err, results, fields) {
    if (err) {
      res.status(500).json(err);
      console.log(err);
    }
    res.status(200).json(results);
  });
});

router.post("/getpo", async (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlPoStr = `SELECT VendorID,PoDate,Tel,Fax,ContactPerson,Currency,Company_name_ch,Address,Zip_code,po.Remark FROM (SELECT * FROM master_db.supplier as S WHERE S.ID = ${param.vendorID}) AS supplierDetail
    JOIN (SELECT * FROM po_db.po as P WHERE P.poID =${param.poID}) As po 
    WHERE supplierDetail.ID = po.VendorID`;

  // const sqlStrPoDetail = `SELECT * FROM master_db.product as pro
  // JOIN (SELECT * FROM po_db.po_detail AS pd where pd.poID =${param.poID})as a  where pro.ID = a.ProductID `;

  const sqlStrPoDetail = `SELECT podetail.ID as PoItemIndex, JSON_OBJECT("PartNumber", pro.PartNumber , "ID", pro.ID, "description", pro.description, "VendorNumber", pro.VendorNumber, "Cost", pro.Cost, "Price", pro.Price, "Remark", pro.Remark, "ReceiveStatus",podetail.ReceiveStatus) as product , 
                          JSON_OBJECT("ID", customer.ID, "Company_name_ch", customer.Company_name_ch) as customer,
                          JSON_OBJECT("value",Application) as Application,JSON_OBJECT("value",BurnOption) as BurnOption, ETD, JSON_OBJECT("value",Packaging) as Packaging, QTY, podetail.UnitCost  , podetail.Remark,
                          cast(IFNULL(SUM(RD.ReceiveQTY),0) as double) as "ReceivedQTY" , podetail.ReceiveStatus
	                        FROM master_db.product as pro 
                          JOIN (SELECT * FROM po_db.po_detail AS pd where pd.poID = ${param.poID} ) as podetail ON pro.ID = podetail.ProductID
                          JOIN (SELECT * FROM master_db.customer ) as customer ON customer.ID = podetail.CustomerID
                          LEFT JOIN (SELECT * FROM po_db.receiving_document  as receiveDocument WHERE receiveDocument.PoNumber = ${param.poID}) as RD ON RD.PoItemIndex = podetail.ID
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

router.post("/deletePo", (req, res) => {
  const sql_delete_podetail = `DELETE  FROM  po_db.po_detail  WHERE poID=${req.body.ID}`;
  const sql_delete_po = `DELETE FROM  po_db.po  WHERE poID=${req.body.ID}`;

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      connection.query(sql_delete_podetail, function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            connection.release();
            throw error;
          });
        }

        console.log(results);

        connection.query(sql_delete_po, function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }
          connection.commit(function (err) {
            if (err) {
              return connection.rollback(function () {
                connection.release();
                throw err;
              });
            }
            res.status(200).json({ message: "success" });
          });
        });
      });
    });
  });
});

router.post("/updatePo", (req, res) => {
  const data = req.body;
  const ItemDataForUpdate = data.orderProduct.map((product, index) => {
    return {
      poID: data.poID,
      ID: product.PoItemIndex,
      Application: product.Application.value,
      BurnOption: product.BurnOption.value,
      ETD: product.ETD,
      Packaging: product.Packaging.value,
      QTY: product.QTY,
      UnitCost: product.UnitCost,
      CustomerId: product.customer.ID,
      ProductID: product.product.ID,
      Remark: product.Remark,
      ReceiveStatus: product.ReceiveStatus,
    };
  });

  const removePOItemsNotInCLIENT = `DELETE FROM po_db.po_detail WHERE ID NOT IN (?) AND poID=${data.poID}`;

  const itemInClient = ItemDataForUpdate.filter((item) => {
    if (item.ID !== "") {
      return item.ID;
    }
  }).map((item, index) => item.ID);

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      // delete from db any po items removed by the user
      connection.query(
        removePOItemsNotInCLIENT,
        [itemInClient],
        function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }

          console.log(results);

          ItemDataForUpdate.map((item, index) => {
            const { ID, ...otherFields } = item;
            const key = Object.keys(otherFields);
            const values = Object.values(otherFields);
            console.log(ID);
            console.log(values);
            const sqlUpdate = `UPDATE po_db.po_detail SET ${key.join(
              "=?,"
            )} =? WHERE ID=${ID}`;

            // if the item has ID (PoItemIndex), then we can update the existing record for the item details
            if (ID !== "") {
              connection.query(sqlUpdate, values, (err, results, fields) => {
                if (err) {
                  return connection.rollback(function () {
                    connection.release();
                    console.log(err);
                  });
                }
                console.log(results);
              });
            } else {
              // if the item does not have an ID (PoItemIndex), then we have to insert the new PO item into the db
              const newItemInsert = `INSERT INTO po_db.po_detail (${key.toString()}) values (?)`;
              connection.query(
                newItemInsert,
                [values],
                (err, results, fields) => {
                  if (err) {
                    return connection.rollback(function () {
                      connection.release();
                      console.log(err);
                    });
                  }
                }
              );
            }
          });

          connection.commit(function (err) {
            if (err) {
              return connection.rollback(function () {
                connection.release();
                throw err;
              });
            }
            res.status(200).json({ message: "success" });
          });
        }
      );
    });
  });
});

module.exports = router;
