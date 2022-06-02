const { json } = require("express");
const express = require("express");

const router = express.Router();
const mysql = require("../src/db/conn");
const db = mysql.connection;
const dbp = mysql.connectionPromist;

router.get("/listPickPackDelivery", async (req, res) => {
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
    delivery.Status IN ('released','picking' 'picked', 'packed')
  GROUP BY delivery.DeliveryID`;

  try {
    const result = await dbp.query(getListOfOpenDelivery);

    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ data: err });
  }
});

router.post("/getDeliveryforPickAndPack", (req, res) => {
  console.log(req.body);
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
    delivery.TimeStamp,
    delivery.PickTime
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

  const onhandStockMinusPickPack = `    
  SELECT 
  aggbyproduct.ProductID AS ProductID,
  product.PartNumber AS PartNumber,
  aggbyproduct.onHandQTY AS onHandQTY,
  aggbyproduct.QtyByProductStatus AS QtyByProductStatus
FROM
  ((SELECT 
      aggbystatus.ProductID AS ProductID,
          SUM(aggbystatus.SumAggStatus) AS onHandQTY,
          JSON_ARRAYAGG(JSON_OBJECT('ProductID', aggbystatus.ProductID, 'Location', aggbystatus.Location, 'BurnOption', aggbystatus.BurnOption, 'Marked', aggbystatus.Marked, 'CodeVersion', aggbystatus.CodeVersion, 'DateCode', aggbystatus.DateCode, 'LotNumber', aggbystatus.LotNumber, 'QTY', aggbystatus.SumAggStatus, 'PickQTY', aggbystatus.SumAggStatusPickQTY)) AS QtyByProductStatus
  FROM
      (SELECT 
      alltrans.ProductID AS ProductID,
          alltrans.Location AS Location,
          alltrans.BurnOption AS BurnOption,
          alltrans.Marked AS Marked,
          alltrans.CodeVersion AS CodeVersion,
          alltrans.LotNumber AS LotNumber,
          alltrans.DateCode AS DateCode,
          SUM(alltrans.QTY) AS SumAggStatus,
          SUM(alltrans.PickQTY) AS SumAggStatusPickQTY
  FROM
      (SELECT 
      rd.ProductID AS ProductID,
          rd.ReceiveQTY AS QTY,
          rd.Location AS Location,
          rd.BurnOption AS BurnOption,
          rd.Marked AS Marked,
          rd.CodeVersion AS CodeVersion,
          rd.LotNumber AS LotNumber,
          rd.DateCode AS DateCode,
          0 AS PickQTY
  FROM
      po_db.receiving_document rd
  WHERE
      TimeStamp > (SELECT 
              TimeStamp
          FROM
              inventory_db.inventory_snapshot
          LIMIT 1) UNION ALL SELECT 
      it.ProductID AS ProductID,
          it.QTY AS QTY,
          it.Location AS Location,
          it.BurnOption AS BurnOption,
          it.Marked AS Marked,
          it.CodeVersion AS CodeVersion,
          it.LotNumber AS LotNumber,
          it.DateCode AS DateCode,
          0 AS PickQTY
  FROM
      inventory_db.inventory_transaction it
  WHERE
      TimeStamp > (SELECT 
              TimeStamp
          FROM
              inventory_db.inventory_snapshot
          LIMIT 1) UNION ALL SELECT 
      p.ProductID AS ProductID,
          p.PickQTY * - 1 AS QTY,
          p.Location AS Location,
          p.BurnOption AS BurnOption,
          p.Marked AS Marked,
          p.CodeVersion AS CodeVersion,
          p.LotNumber AS LotNumber,
          p.DateCode AS DateCode,
          0 AS PickQTY
  FROM
      sales_db.pick p
  LEFT JOIN sales_db.delivery delivery ON P.DeliveryID = delivery.DeliveryID
  WHERE
      P.TimeStamp > (SELECT 
              TimeStamp
          FROM
              inventory_db.inventory_snapshot
          LIMIT 1)
          AND delivery.Status IN ('shipped' , 'picking', 'picked', 'packed') UNION ALL SELECT 
      pk.ProductID AS ProductID,
          0 AS QTY,
          pk.Location AS Location,
          pk.BurnOption AS BurnOption,
          pk.Marked AS Marked,
          pk.CodeVersion AS CodeVersion,
          pk.LotNumber AS LotNumber,
          pk.DateCode AS DateCode,
          PK.PickQTY AS PickQTY
  FROM
      sales_db.pick pk
  WHERE
      DeliveryID = ${req.body.DeliveryID} UNION ALL SELECT 
      ivs.ProductID AS ProductID,
          ivs.QTY AS QTY,
          ivs.Location AS Location,
          ivs.BurnOption AS BurnOption,
          ivs.Marked AS Marked,
          ivs.CodeVersion AS CodeVersion,
          ivs.LotNumber AS LotNumber,
          ivs.DateCode AS DateCode,
          0 AS PickQTY
  FROM
      inventory_db.inventory_snapshot AS ivs) alltrans
  GROUP BY alltrans.ProductID , alltrans.Location , alltrans.BurnOption , alltrans.Marked , alltrans.CodeVersion , alltrans.LotNumber , alltrans.DateCode ) aggbystatus
  WHERE
      (aggbystatus.SumAggStatus > 0 OR SumAggStatusPickQTY>0)
  GROUP BY aggbystatus.ProductID) aggbyproduct
  LEFT JOIN (SELECT 
      master_db.product.ProductID AS ProductID,
          master_db.product.PartNumber AS PartNumber
  FROM
      master_db.product) product ON ((aggbyproduct.ProductID = product.ProductID)))`;

  const promisePool = db.promise();
  const delivery = promisePool.query(deliveryStr);
  const deliveryDetail = promisePool.query(deliveryDetailStr);
  const onHandStock = promisePool.query(onhandStockMinusPickPack);

  Promise.all([delivery, deliveryDetail, onHandStock])
    .then((results) => {
      const deliveryInfo = {
        ...results[0][0][0],
        orderProduct: results[1][0],
      };

      deliveryInfo.orderProduct.map((item) => {
        item["onHandProduct"] = results[2][0].filter(
          (obj) => obj.ProductID === item.ProductID
        );
      });

      const newObj = JSON.parse(JSON.stringify(deliveryInfo));
      console.log("newobj", newObj);
      deliveryInfo.orderProduct.map((item, itemIndex) => {
        item.onHandProduct[0].QtyByProductStatus.map((stock, stockIndex) => {
          if (
            stock.BurnOption !== item.BurnOption ||
            stock.CodeVersion !== item.CodeVersion ||
            stock.Marked !== item.Marked
          ) {
            if (stock.PickQTY > 0) {
              newObj.orderProduct[
                itemIndex
              ].onHandProduct[0].QtyByProductStatus[stockIndex].PickQTY = 0;
            }
            if (stock.QTY <= 0) {
              delete newObj.orderProduct[itemIndex].onHandProduct[0]
                .QtyByProductStatus[stockIndex];
            }
          }
        });
      });

      newObj.orderProduct.map((item, index) => {
        item.onHandProduct[0].QtyByProductStatus =
          item.onHandProduct[0].QtyByProductStatus.filter(
            (obj) => obj !== null
          );
      });

      console.log(newObj);
      res.status(200).json(newObj);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/deletePickPack", async (req, res) => {
  console.log(req.body);
  const strDeletePacking = `DELETE FROM sales_db.pack WHERE DeliveryID=${req.body.DeliveryID}`;
  const strDeletePick = `DELETE FROM sales_db.pick WHERE DeliveryID = ${req.body.DeliveryID}`;
  const strDeliveryStatusBlock = `UPDATE sales_db.delivery SET Status ='block' WHERE DeliveryID =${req.body.DeliveryID}`;

  try {
    const connection = await dbp.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(strDeletePacking);
      await connection.query(strDeletePick);
      await connection.query(strDeliveryStatusBlock);
      await connection.commit();
      res
        .status(200)
        .json({ data: `Set delivery ${req.body.DeliveryID} status to block ` });
    } catch (err) {
      console.log(err);
      res.status(500).json({ data: err });
    }
  } catch (err) {
    console.log(err);
    console.log("errs");
    res.status(500).json({ data: err });
  }
});

router.post("/deletePack", async (req, res) => {
  console.log(req.body);
  const strDeletePacking = `DELETE FROM sales_db.pack WHERE DeliveryID=${req.body.DeliveryID}`;
  const strDeliveryStatusBlock = `UPDATE sales_db.delivery SET Status ='picking' WHERE DeliveryID =${req.body.DeliveryID}`;

  try {
    const connection = await dbp.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(strDeletePacking);
      await connection.query(strDeliveryStatusBlock);
      await connection.commit();
      res.status(200).json({
        data: `Set delivery ${req.body.DeliveryID} status to picking `,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ data: err });
    }
  } catch (err) {
    console.log(err);
    console.log("errs");
    res.status(500).json({ data: err });
  }
});

router.post("/savepickpack", async (req, res) => {
  console.log(req.body);

  const verifyConcurrentAccess = `SELECT PickTime from sales_db.delivery WHERE deliveryID = ${req.body.DeliveryID}`;
  const [shipTime, other] = await dbp.query(verifyConcurrentAccess);
  if (shipTime[0].PickTime !== req.body.PickTime) {
    res.status(250).json("Someone Modified the pick detail before you");
    return;
  }

  try {
    const connection = await dbp.getConnection();
    try {
      await connection.beginTransaction();
      const UpdateDeliveryPickTimeAndStatus = `UPDATE sales_db.delivery SET PickTime = current_timestamp(3), Status ="${req.body.Status}" WHERE DeliveryID = ${req.body.DeliveryID} `;
      await connection.query(UpdateDeliveryPickTimeAndStatus);
      const deletePackDetail = `DELETE FROM sales_db.pack WHERE DeliveryID = ${req.body.DeliveryID}`;
      await connection.query(deletePackDetail);
      const deletePickDetail = `DELETE FROM sales_db.pick WHERE DeliveryID=${req.body.DeliveryID}`;
      await connection.query(deletePickDetail);

      req.body.PickItems.map(async (item, index) => {
        await connection.query(
          `INSERT INTO sales_db.pick(${Object.keys(
            item
          ).toString()}) VALUES (?)`,
          [Object.values(item)]
        );
      });

      await connection.commit();
    } catch (err) {
      console.log(err);
      connection.rollback();
      connection.release();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
  res.status(200).json(`picking detail is saved`);
});

module.exports = router;
