const express = require("express");
const router = express.Router();
const mysql = require("../src/db/conn");
const db = mysql.connection;

router.post("/createSalesOrder", (req, res) => {
  const values = req.body;
  console.log(values);

  const SOInfo = {
    CustomerID: values.CustomerID,
    CustomerOrderNumber: values.CustomerOrderNumber.toUpperCase(),
    SalesOrderDate: values.SalesOrderDate,
    DeliveryAddress: values.DeliveryAddress.toUpperCase(),
    DeliveryZip: values.DeliveryZip.toUpperCase(),
    Currency: values.Currency.toUpperCase(),
    Incoterms: values.Incoterms.toUpperCase(),
    Remark: values.Remark,
    Status: "open",
  };

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      const SODetailkeys = Object.keys(SOInfo);
      const SODetailValue = Object.values(SOInfo);
      connection.query(
        `INSERT INTO sales_db.sales_order (${SODetailkeys.toString()}) VALUES(?)`,
        [SODetailValue],
        function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }

          const insertSOID = results.insertId;
          const podetailKeys = `(SalesOrderID, ProductID, BurnOption, ETD, QTY, UnitPrice, Remark)`;

          const SODetail = values.orderProduct.map((product, index) => [
            insertSOID,
            product.product.ProductID,
            product.BurnOption.value.toUpperCase(),
            product.ETD,
            product.QTY,
            product.UnitPrice,
            product.remark,
          ]);
          console.log(SODetail);

          connection.query(
            `INSERT INTO sales_db.sales_order_detail ${podetailKeys} VALUES ?`,
            [SODetail],
            function (error, results, fields) {
              if (error) {
                return connection.rollback(function () {
                  connection.release();
                  res.status(500).send(error);
                  throw error;
                });
              }
              console.log(results);
              connection.commit(function (err) {
                if (err) {
                  return connection.rollback(function () {
                    connection.release();
                    res.status(500).send(err);
                    throw err;
                  });
                } else {
                  connection.release();
                  res.status(200).json({ data: insertSOID });
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

router.get("/getOpenSalesList", (req, res) => {
  const sqlGetOpenSalesList = `SELECT 
    SO.SalesOrderID as id,
    So.CustomerID,
    Customer.Company_name_ch,
    SO.CustomerOrderNumber,
    DATE_FORMAT(SO.SalesOrderDate, "%Y-%M-%d") AS SalesOrderDate,
    SO.Status
FROM
    sales_db.sales_order SO
        JOIN
    master_db.customer Customer ON SO.CustomerID = Customer.CustomerID
WHERE
    SO.Status IN ('open' , 'partial deliver') ORDER BY SO.SalesOrderID`;

  db.query(sqlGetOpenSalesList, (err, results, fields) => {
    if (err) {
      res.status(500).send(err);
      console.log(err);
    }

    res.status(200).json(results);
  });
});

router.post("/getSalesOrderDetail", (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlSOStr = `SELECT SalesOrderID, Company_name_ch, so.CustomerID, so.CustomerOrderNumber, 
  ReferenceNumber,DATE_FORMAT(SalesOrderDate, "%Y-%m-%d") as SalesOrderDate, Currency, Incoterms, Tel, Fax, ContactPerson,
  Email, BillingAddress, BillingZip, so.DeliveryAddress, so.DeliveryZip, so.Status,
  so.Remark  
  FROM 
  sales_db.sales_order so
  join master_db.customer customer on so.CustomerID = customer.customerID
  WHERE so.salesOrderID= ${param.salesOrderID}`;

  const sqlSODtailStr = `
  SELECT
  salesDetails.SoDetailID, 
  JSON_OBJECT("ProductID", salesDetails.ProductID,"PartNumber", product.PartNumber) as product,
  JSON_OBJECT("value",salesDetails.BurnOption) as BurnOption,
  DATE_FORMAT(salesDetails.ETD, "%Y-%m-%d") AS ETD ,
  salesDetails.QTY,
  CAST(COALESCE(SUM(deliveryDetail.DeliveryQTY), 0) AS SIGNED) AS DeliveryQTY,
  salesDetails.UnitPrice,
  salesDetails.Remark,
  salesDetails.DeliveryStatus
FROM
  (SELECT 
      *
  FROM
      sales_db.sales_order_detail salesDetail
  WHERE
      salesDetail.SalesOrderID = ${param.salesOrderID}) AS salesDetails
      LEFT JOIN
  sales_db.delivery_detail deliveryDetail ON deliveryDetail.SoDetailID = salesDetails.SoDetailID
      LEFT JOIN
  master_db.product product ON salesDetails.productID = product.ProductID
GROUP BY salesDetails.SoDetailID`;

  const promisePool = db.promise();
  const So = promisePool.query(sqlSOStr);
  const Sodetail = promisePool.query(sqlSODtailStr);

  Promise.all([So, Sodetail])
    .then((results) => {
      const poInfo = { ...results[0][0][0], orderProduct: results[1][0] };
      console.log(poInfo);
      res.status(200).json(poInfo);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/deleteSalesOrder", (req, res) => {
  const param = req.body;
  console.log(param);
  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      connection.query(
        `DELETE FROM sales_db.sales_order_detail WHERE SalesOrderID = ${param.salesOrderID}`,
        (err, results, feilds) => {
          if (err) {
            return connection.rollback(function () {
              connection.release();
              res.status(500).send(err);
              throw err;
            });
          }

          console.log(results);

          connection.query(
            `DELETE FROM sales_db.sales_order WHERE SalesOrderID = ${param.salesOrderID}`,
            (err, results, fields) => {
              if (err) {
                return connection.rollback(function () {
                  connection.release();
                  res.status(500).send(err);
                  throw err;
                });
              }

              console.log(results);
              connection.commit(function (err) {
                if (err) {
                  return connection.rollback(function () {
                    connection.release();
                    res.status(500).send(err);
                    throw err;
                  });
                } else {
                  connection.release();
                  res.status(200).json({ message: 1 });
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

router.post("/updateSalesOrder", (req, res) => {
  const data = req.body;
  console.log(data);

  const SoData = {
    CustomerID: data.CustomerID,
    CustomerOrderNumber: data.CustomerOrderNumber,
    ReferenceNumber: data.ReferenceNumber,
    SalesOrderDate: data.SalesOrderDate,
    Currency: data.Currency,
    Incoterms: data.Incoterms,
    Remark: data.Remark,
    Status: data.Status,
    DeliveryAddress: data.DeliveryAddress,
    DeliveryZip: data.DeliveryZip,
  };

  console.log(data);
  const ItemDataForUpdate = data.orderProduct.map((product, index) => {
    return {
      SoDetailID: product.SoDetailID,
      BurnOption: product.BurnOption.value,
      ETD: product.ETD,
      QTY: product.QTY,
      UnitPrice: product.UnitPrice,
      Remark: product.Remark,
      SalesOrderID: data.SalesOrderID,
      ProductID: product.product.ProductID,
      DeliveryStatus: product.DeliveryStatus,
    };
  });

  console.log(ItemDataForUpdate);

  const itemInClient = ItemDataForUpdate.filter((item) => {
    if (item.SoDetailID !== "") {
      return item.SoDetailID;
    }
  }).map((item, index) => item.SoDetailID);

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      connection.query(
        `UPDATE sales_db.sales_order SET ${Object.keys(SoData).join(
          "=?,"
        )}=? WHERE SalesOrderID=${data.SalesOrderID}`,
        Object.values(SoData),
        (err, results, field) => {
          if (err) {
            return connection.rollback(function () {
              connection.release();
              throw err;
            });
          }

          // delete from db any po items removed by the user
          connection.query(
            `DELETE FROM sales_db.sales_order_detail WHERE SoDetailID NOT IN (?) AND SalesOrderID=${data.SalesOrderID}`,
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
                const { SoDetailID, ...otherFields } = item;
                const key = Object.keys(otherFields);
                const values = Object.values(otherFields);
                console.log(SoDetailID);
                console.log(values);

                // if the item has ID ( SoDetailID), then we can update the existing record for the item details
                if (SoDetailID !== "") {
                  connection.query(
                    `UPDATE sales_db.sales_order_detail SET ${key.join(
                      "=?,"
                    )} =? WHERE SoDetailID=${SoDetailID}`,
                    values,
                    (err, results, fields) => {
                      if (err) {
                        return connection.rollback(function () {
                          connection.release();
                          console.log(err);
                        });
                      }
                      console.log(results);
                    }
                  );
                } else {
                  // if the item does not have an ID ( SoDetailID), then we have to insert the new PO item into the db
                  connection.query(
                    `INSERT INTO sales_db.sales_order_detail (${key.toString()}) VALUES (?)`,
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
        }
      );
    });
  });
});

router.post("/getSalesOrderAvaibility", (req, res) => {
  const param = req.body.salesOrderID;

  const sqlStr = `
    SET @SNAPSHOTTIME := (SELECT TimeStamp FROM inventory_db.inventory_snapshot  LIMIT 1); 
    SET @SALES_ORDER_PRODUCTID := (SELECT  group_concat( DISTINCT ProductID)FROM sales_db.sales_order_detail WHERE SalesOrderID = ${param}  );
  
    SELECT  product.ProductID, product.PartNumber, CAST(coalesce( SUM(QTY), 0 ) AS double) as AvailableQTY FROM
         (SELECT ProductID, PartNumber  FROM master_db.product product WHERE FIND_IN_SET(ProductID, @SALES_ORDER_PRODUCTID) ) as product
        LEFT JOIN
        (SELECT 
            ProductID, QTY
        FROM
            inventory_db.inventory_snapshot WHERE FIND_IN_SET(ProductID, @SALES_ORDER_PRODUCTID) UNION ALL SELECT 
            ProductID, QTY
        FROM
            inventory_db.inventory_transaction 
        WHERE
            TimeStamp > @SNAPSHOTTIME AND FIND_IN_SET(ProductID, @SALES_ORDER_PRODUCTID) UNION ALL SELECT 
            ProductID, ReceiveQTY AS QTY
        FROM
            po_db.receiving_document
        WHERE
            Timestamp > @SNAPSHOTTIME AND FIND_IN_SET(ProductID, @SALES_ORDER_PRODUCTID) UNION ALL SELECT 
            ProductID, PickQTY * - 1 AS QTY
        FROM
            sales_db.pick_pack
        WHERE
            ShipDateTime > @SNAPSHOTTIME
                AND Status = 'shipped' AND FIND_IN_SET(ProductID, @SALES_ORDER_PRODUCTID) UNION ALL SELECT 
            ProductID, DeliveryQTY * - 1 AS QTY
        FROM
            sales_db.delivery_detail
        WHERE
            Status = 'open' AND FIND_IN_SET(ProductID, @SALES_ORDER_PRODUCTID)) AS agg ON product.ProductID = agg.ProductID
    GROUP BY ProductID;`;

  db.query(sqlStr, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).send("something went wrong");
    }
    res.status(200).json(results[2]);
  });
});

module.exports = router;
