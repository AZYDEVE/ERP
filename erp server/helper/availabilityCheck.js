const express = require("express");
const router = express.Router();
const mysql = require("../src/db/conn");
const dbp = mysql.connectionPromist;

const checkAvailabilityByItems = async (ProductID) => {
  const sqlStr = `
  
  SET @SNAPSHOTTIME := (SELECT TimeStamp FROM inventory_db.inventory_snapshot  LIMIT 1); 
  
  SELECT  product.ProductID, product.PartNumber, CAST(coalesce( SUM(QTY), 0 ) AS double) as AvailableQTY FROM
       (SELECT ProductID, PartNumber  FROM master_db.product product WHERE ProductID IN (${ProductID.toString()}) ) as product
      LEFT JOIN
      (SELECT 
          ProductID, QTY
      FROM
          inventory_db.inventory_snapshot WHERE  ProductID IN (${ProductID.toString()})  UNION ALL SELECT 
          ProductID, QTY
      FROM
          inventory_db.inventory_transaction 
      WHERE
          TimeStamp > @SNAPSHOTTIME AND  ProductID IN (${ProductID.toString()})  UNION ALL SELECT 
          ProductID, ReceiveQTY AS QTY
      FROM
          po_db.receiving_document
      WHERE
          Timestamp > @SNAPSHOTTIME AND  ProductID IN (${ProductID.toString()})  UNION ALL SELECT 
          ProductID, PickQTY * - 1 AS QTY
      FROM
          sales_db.pick s LEFT JOIN sales_db.delivery d ON s.DeliveryID = d.DeliveryID 
      WHERE
          s.TimeStamp > @SNAPSHOTTIME
              AND d.Status = 'shipped' AND  ProductID IN (${ProductID.toString()})  UNION ALL SELECT 
          ProductID, DeliveryQTY * - 1 AS QTY
      FROM
          sales_db.delivery_detail
      WHERE
          Status = 'open' AND  ProductID IN (${ProductID.toString()}) )  AS agg ON product.ProductID = agg.ProductID
  GROUP BY ProductID;`;

  return await dbp.query(sqlStr);
};

module.exports = checkAvailabilityByItems;
