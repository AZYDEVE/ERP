const { json } = require("express");
const express = require("express");
const parserMarkdown = require("prettier/parser-markdown");
const { connection } = require("../src/db/conn");
const router = express.Router();
const mysql = require("../src/db/conn");
const db = mysql.connection;
const dbp = mysql.connectionPromist;

router.post("/getSalesOrderDetailForCreateDelivery", (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlSOStr = `SELECT SalesOrderID, Company_name_ch, so.CustomerID, so.CustomerOrderNumber, 
    DATE_FORMAT(CURDATE(), "%Y-%m-%d") as CreateDate, '' AS ShipDate, so.DeliveryAddress, so.DeliveryZip, so.Status,
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
    '' as CodeVersion,
    'No' as Marked,
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

router.post("/createDelivery", async (req, res) => {
  const param = req.body;
  console.log(param);
  const deliveryProductIDS = param.orderProduct.map((item) => {
    return item.product.ProductID;
  });

  const connection = await dbp.getConnection();
  try {
    const saleOrderTime = await connection.query(
      `SELECT TimeStamp FROM sales_db.sales_order WHERE SalesOrderID =${param.SalesOrderID} `
    );

    if (saleOrderTime[0][0].TimeStamp !== param.TimeStamp) {
      res
        .status(250)
        .json({ data: "sales order is updated during delivery creation" });
      connection.release();
      return;
    }

    const availabilityCheck = require("../helper/availabilityCheck");
    const availableStock = await availabilityCheck(deliveryProductIDS);
    const availability = {};
    availableStock[0][1].map((item) => {
      availability[item.ProductID] = item.AvailableQTY;
    });

    let isNegative = false;
    param.orderProduct.map((item) => {
      console.log(availability[item.product.ProductID]);
      const qty = availability[item.product.ProductID] - item.DeliveryQTY;
      console.log(qty);
      if (qty < 0) {
        isNegative = true;
      }
    });

    if (isNegative) {
      res.status(250).json({
        data: `deliver more than available`,
      });
      console.log("not available");

      connection.release();
      return;
    }

    await connection.beginTransaction();
    await connection.query(
      `UPDATE sales_db.sales_order SET Status="${param.Status}" WHERE SalesOrderID = ${param.SalesOrderID} `
    );

    const delivery = {
      SalesOrderID: param.SalesOrderID,
      CreateDate: param.CreateDate,
      ShipDate: param.ShipDate,
      Remark: param.Remark,
      Status: "block",
    };

    const createDelivery = `INSERT INTO sales_db.delivery( ${Object.keys(
      delivery
    ).toString()}) VALUES (?)`;

    const deliveryNumber = await connection.query(createDelivery, [
      Object.values(delivery),
    ]);
    console.log(deliveryNumber[0].insertId);

    param.orderProduct.map(async (obj, index) => {
      const deliveryDetail = {
        SoDetailID: obj.SoDetailID,
        DeliveryID: deliveryNumber[0].insertId,
        ProductID: obj.product.ProductID,
        DeliveryQTY: obj.DeliveryQTY,
        BurnOption: obj.BurnOption.value,
        CodeVersion: obj.CodeVersion,
        Marked: obj.Marked,
        Remark: obj.Remark,
        Status: obj.Status,
      };
      await connection.query(
        `INSERT INTO sales_db.delivery_detail (${Object.keys(
          deliveryDetail
        ).toString()}) VALUES(?)`,
        [Object.values(deliveryDetail)]
      );
    });
    await connection.commit();

    res.status(200).json({ data: deliveryNumber[0].insertId });
  } catch (err) {
    console.log("catch");
    console.log(err);
    await connection.rollback();
    connection.release();
    res.status(500).json({ data: "err" });
  }
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
  delivery.Status IN ('block' , 'released','picking', 'picked','packing', 'packed')
GROUP BY delivery.DeliveryID`;

  db.query(getListOfOpenDelivery, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).json({ data: err });
    }
    res.status(200).json(results);
  });
});

router.get("/listPickPackDelivery", (req, res) => {
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
  delivery.Status IN ('released','picking', 'picked', 'packed')
GROUP BY delivery.DeliveryID`;

  db.query(getListOfOpenDelivery, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).json({ data: err });
    }
    res.status(200).json(results);
  });
});

router.post("/getDelivery", (req, res) => {
  const deliveryStr = `
  SELECT 
  DeliveryID,
  delivery.SalesOrderID,
  SO.CustomerID,
  customer.Company_name_ch,
  SO.CustomerOrderNumber,
  delivery.CreateDate,
  delivery.ShipDate,
  SO.DeliveryAddress,
  SO.DeliveryZip,
  IF (delivery.Remark='null','',delivery.Remark) as Remark,
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
  deliveryDetail.DeliveryItemID,
  deliveryDetail.ProductID,
  PartNumber,
  BurnOption,
  IF( deliveryDetail.CodeVersion='null','', deliveryDetail.CodeVersion) as CodeVersion,
  deliveryDetail.Marked,
  DeliveryQTY,
  IF(DeliveryDetail.Remark="null","",DeliveryDetail.Remark) as Remark
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

router.post("/deleteDelivery", async (req, res) => {
  try {
    const deliveryStatus = await dbp.query(
      `SELECT Status FROM sales_db.delivery WHERE DeliveryID = ${req.body.DeliveryID}`
    );

    const connection = await dbp.getConnection();
    if (deliveryStatus[0][0].Status === "block") {
      const strDeliveryDetail = `DELETE FROM sales_db.delivery_detail WHERE DeliveryID = ${req.body.DeliveryID}`;
      const strDelivery = `DELETE FROM sales_db.delivery WHERE DeliveryID = ${req.body.DeliveryID}`;

      try {
        await connection.beginTransaction();
        await connection.query(strDeliveryDetail);
        const result = await connection.query(strDelivery);
        console.log(result);
        connection.commit();

        res
          .status(200)
          .json({ data: `Deleted delivery # ${req.body.DeliveryID}` });
      } catch (err) {
        console.log(err);
        connection.rollback();
        connection.release();
        res.status(500).json({ data: err });
      }
    } else {
      res
        .status(250)
        .json({ data: `Cannot delete, Only block delivery can be deleted` });
    }
  } catch (err) {
    res.status(500).json({ data: err });
  }
});

router.post("/releaseDelivery", async (req, res) => {
  try {
    const deliveryStatus = await dbp.query(
      `SELECT Status FROM sales_db.delivery WHERE DeliveryID = ${req.body.DeliveryID}`
    );
    if (deliveryStatus[0][0].Status === "block") {
      const result = await dbp.query(
        `UPDATE sales_db.delivery SET Status = 'released' WHERE DeliveryID = ${req.body.DeliveryID}`
      );
      console.log(result);
      res.status(200).json({
        data: `Delivery# ${req.body.DeliveryID} is released for pick and pack`,
      });
    } else {
      res.status(250).json({
        data: `Delivery# ${req.body.DeliveryID} is already released`,
      });
    }
  } catch (err) {
    res.status(500).json({ data: err });
  }
});

router.post("/updateDelivery", async (req, res) => {
  try {
    const connection = await dbp.getConnection();

    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE sales_db.delivery SET ShipDate = '${
          req.body.ShipDate
        }', Remark = '${
          req.body.Remark == "" ? null : req.body.Remark
        }' WHERE DeliveryID = ${req.body.DeliveryID}`
      );

      req.body.orderProduct.map(async (item) => {
        console.log(item);
        await connection.query(
          `UPDATE sales_db.delivery_detail SET Remark = '${
            item.Remark === "" ? null : item.Remark
          }', CodeVersion='${item.CodeVersion}', Marked='${
            item.Marked
          }' WHERE DeliveryItemID = ${item.DeliveryItemID} `
        );
      });
      connection.commit();
      res.status(200).json({ data: `Updated Successfully` });
    } catch (err) {
      connection.rollback();
      connection.release();
      console.log(err);
      res.status(500).json({ data: err });
    }
  } catch (err) {
    res.status(500).json({ data: err });
  }
});

module.exports = router;
