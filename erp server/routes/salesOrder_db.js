const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

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
            product.product.ID,
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
    SO.SalesOrderDate,
    SO.Status
FROM
    sales_db.sales_order SO
        JOIN
    master_db.customer Customer ON SO.CustomerID = Customer.CustomerID
WHERE
    SO.Status IN ('open' , 'partial')`;

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
  const sqlSOStr = `SELECT SalesOrderID, Company_name_ch, so.CustomerID, 
  ReferenceNumber,SalesOrderDate, Currency, Incoterms, Tel, Fax, ContactPerson,
  Email, BillingAddress, BillingZip, so.DeliveryAddress, so.DeliveryZip, 
  so.Remark  
  FROM 
  sales_db.sales_order so
  join master_db.customer customer on so.CustomerID = customer.customerID
  WHERE so.salesOrderID= ${param.salesOrderID}`;

  const sqlSODtailStr = `
  SELECT 
  PartNumber,
  salesDetails.ProductID,
  salesDetails.BurnOption,
  salesDetails.ETD,
  salesDetails.QTY,
  CAST(COALESCE(SUM(deliveryDetail.DeliveryQTY), 0) AS SIGNED) AS DeliveryQTY,
  salesDetails.UnitPrice
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
  master_db.product product ON salesDetails.productID = product.ID
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

module.exports = router;
