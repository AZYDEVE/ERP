const express = require("express");
const router = express.Router();
const mysql = require("../src/db/conn");
const db = mysql.connectionPromist;

const checkAvailabilityByItems = (ProductID) => {
  console.log(ProductID);
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
          sales_db.pick_pack
      WHERE
          ShipDateTime > @SNAPSHOTTIME
              AND Status = 'shipped' AND  ProductID IN (${ProductID.toString()})  UNION ALL SELECT 
          ProductID, DeliveryQTY * - 1 AS QTY
      FROM
          sales_db.delivery_detail
      WHERE
          Status = 'open' AND  ProductID IN (${ProductID.toString()}) )  AS agg ON product.ProductID = agg.ProductID
  GROUP BY ProductID;`;

  return new Promise(function (resolve, reject) {
    db.query(sqlStr, (err, result, fields) => {
      if (err) {
        console.log(err);
        reject(new Error(err.toString()));
      }

      resolve(result);
    });
  });
};

module.exports = checkAvailabilityByItems;
