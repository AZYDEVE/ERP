const express = require("express");
const router = express.Router();
const mysql = require("../src/db/conn");
const db = mysql.connection;

router.post("/getSalesOrderDetailForCreateDelivery", (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlSOStr = `SELECT SalesOrderID, Company_name_ch, so.CustomerID, so.CustomerOrderNumber, 
    DATE_FORMAT(CURDATE(), "%Y-%m-%d") as CreateDate, '' AS ShipDate, so.DeliveryAddress, so.DeliveryZip, 'block' as Status,
    '' as Remark, so.TimeStamp 
    FROM 
    sales_db.sales_order so
    join master_db.customer customer on so.CustomerID = customer.customerID
    WHERE so.salesOrderID= ${param.salesOrderID}`;

  const sqlSODtailStr = `
    SELECT
    salesDetails.SoDetailID, 
    JSON_OBJECT("ProductID", salesDetails.ProductID,"PartNumber", product.PartNumber) as product,
    JSON_OBJECT("value",salesDetails.BurnOption) as BurnOption,
    salesDetails.QTY - CAST(COALESCE(SUM(deliveryDetail.DeliveryQTY), 0) AS SIGNED) AS OpenQTY,
    0 as DeliveryQTY,
    '' as Remark,
    'open' as Status,
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

router.post("/createDelivery", (req, res) => {
  const param = req.body;
  console.log(param);
  const deliveryProductIDS = param.orderProduct.map((item) => {
    return item.product.ProductID;
  });
  console.log(deliveryProductIDS);

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      connection.query(
        `SELECT TimeStamp FROM sales_db.sales_order WHERE SalesOrderID =${param.SalesOrderID} `,
        async (err, results, field) => {
          if (err) {
            return connection.rollback(function () {
              connection.release();
              throw err;
            });
          }

          if (param.TimeStamp !== results[0].TimeStamp) {
            res.status(500).json({
              data: "transaction is denied, Someone made changes to the sales order",
            });

            return connection.rollback(function () {
              connection.release();
            });
          }

          const availabilityCheck = require("../helper/availabilityCheck");
          const availabilityResult = await availabilityCheck(
            deliveryProductIDS
          );

          let isNegative = false;
          console.log(availabilityResult);
          availabilityResult[1].map((product) => {
            console.log(product);
            if (product.AvailableQTY < 0) {
              isNegative = true;
            }
          });

          if (isNegative) {
            res.status(500).json({ data: `something went wrong` });
            return connection.rollback(function () {
              connection.release();
              throw err;
            });
          }

          connection.query(
            `UPDATE sales_db.sales_order SET Status="partial deliver" WHERE SalesOrderID = ${param.SalesOrderID} `,
            (err, results, field) => {
              if (err) {
                console.log(err);
                res.status(500).json({ data: err });
                return connection.rollback(function () {
                  connection.release();

                  throw err;
                });
              }

              const delivery = {
                SalesOrderID: param.SalesOrderID,
                CreateDate: param.CreateDate,
                ShipDate: param.ShipDate,
                Remark: param.Remark,
                Status: param.Status,
              };

              const createDelivery = `INSERT INTO sales_db.delivery( ${Object.keys(
                delivery
              ).toString()}) VALUES (?)`;

              connection.query(
                createDelivery,
                [Object.values(delivery)],
                async (err, deliveryInsertResults, fields) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json({ data: err });
                    return connection.rollback(function () {
                      connection.release();
                      throw err;
                    });
                  }

                  console.log(deliveryInsertResults);
                  param.orderProduct.map((obj, index) => {
                    const deliveryDetail = {
                      SoDetailID: obj.SoDetailID,
                      DeliveryID: deliveryInsertResults.insertId,
                      ProductID: obj.product.ProductID,
                      DeliveryQTY: obj.DeliveryQTY,
                      BurnOption: obj.BurnOption.value,
                      Remark: obj.Remark,
                      Status: obj.Status,
                    };
                    connection.query(
                      `INSERT INTO sales_db.delivery_detail (${Object.keys(
                        deliveryDetail
                      ).toString()}) VALUES(?)`,
                      [Object.values(deliveryDetail)],
                      (err, deliveryDetailInsertResult, field) => {
                        if (err) {
                          console.log(err);
                          res.status(500).json({ data: err });
                          return connection.rollback(function () {
                            connection.release();
                            throw err;
                          });
                        }
                      }
                    );
                  });

                  connection.commit(function (err) {
                    if (err) {
                      res.status(500).json({ data: err });
                      return connection.rollback(function () {
                        connection.release();
                        throw err;
                      });
                    }
                    res.status(200).json({
                      data: deliveryInsertResults.insertId,
                    });
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

router.get("/listOpenDelivery", (req, res) => {
  const getListOfOpenDelivery = `
SELECT 
  delivery.DeliveryID as id,
  delivery.DeliveryID,
  delivery.SalesOrderID,
  CreateDate,
  ShipDate,
  Company_name_ch,
  SUM(deliveryDetail.DeliveryQTY * SoDetail.UnitPrice) AS Amount,
  delivery.Status
FROM
  sales_db.delivery delivery
      RIGHT JOIN
  sales_db.delivery_detail deliveryDetail ON delivery.DeliveryID = deliveryDetail.DeliveryID
      LEFT JOIN
  sales_db.sales_order SO ON delivery.SalesOrderID = SO.SalesOrderID
      LEFT JOIN
  sales_db.sales_order_detail SOdetail ON SOdetail.SoDetailID = deliveryDetail.SoDetailID
      LEFT JOIN
  master_db.customer customer ON SO.CustomerID = customer.CustomerID
WHERE
  delivery.Status IN ('block' , 'released', 'picking', 'packed')
GROUP BY delivery.DeliveryID`;

  db.query(getListOfOpenDelivery, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).json({ data: err });
    }
    res.status(200).json(results);
  });
});

router.get("/getDelivery", (req, res) => {
  const deliveryStr = `
  SELECT 
  DeliveryID,
  delivery.SalesOrderID,
  customer.Company_name_ch,
  SO.CustomerOrderNumber,
  delivery.CreateDate,
  delivery.ShipDate,
  SO.DeliveryAddress,
  SO.DeliveryZip,
  delivery.Remark,
  delivery.Status,
  delivery.TimeStamp 
FROM
  sales_db.delivery AS delivery
      LEFT JOIN
  sales_db.sales_order AS SO ON delivery.SalesOrderID = SO.SalesOrderID
      LEFT JOIN
  master_db.customer customer ON customer.CustomerID = SO.CustomerID
WHERE
  DeliveryID = ${req.body.DeliveryID} `;

  const deliveryDetailStr = `
  SELECT 
  deliveryDetail.ProductID,
  PartNumber,
  BurnOption,
  DeliveryQTY
FROM
  sales_db.delivery_detail deliveryDetail
      JOIN
  master_db.product product ON deliveryDetail.ProductID = product.ProductID
WHERE
  deliveryDetail.DeliveryID = ${req.body.DeliveryID}`;
  const promisePool = db.promise();
  const delivery = promisePool.query(deliveryStr);
  const deliveryDetail = promisePool.query(deliveryDetailStr);

  Promise.all([delivery, deliveryDetail])
    .then((results) => {
      const deliveryInfo = { ...results[0][0][0], orderProduct: results[1][0] };
      console.log(deliveryInfo);
      res.status(200).json(deliveryInfo);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/gettest", (req, res) => {
  const avaCheck = require("../helper/availabilityCheck");

  avaCheck(req.body.ProductID, function (result, err) {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.status(200).json(result);
  });
});
module.exports = router;
