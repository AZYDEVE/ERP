const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.post("/getSalesOrderDetailForCreateDelivery", (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlSOStr = `SELECT SalesOrderID, Company_name_ch, so.CustomerID, so.CustomerOrderNumber, 
    DATE_FORMAT(CURDATE(), "%Y-%m-%d") as CreateDate, '' AS ShipDate, so.DeliveryAddress, so.DeliveryZip, so.Status,
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
    salesDetails.QTY - CAST(COALESCE(SUM(deliveryDetail.DeliveryQTY), 0) AS SIGNED) AS OpenQTY,
    0 as DeliveryQTY,
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

module.exports = router;
