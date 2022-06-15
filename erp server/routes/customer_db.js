const { json } = require("express");
const express = require("express");
const { connection } = require("../src/db/conn");

const router = express.Router();
const mysql = require("../src/db/conn");
const db = mysql.connection;
const dbp = mysql.connectionPromist;

// console.log("the db is:", db);
router.get("/getConnection_status", (req, res) => {
  db.query(
    `SELECT * FROM master_db.customer WHERE Customer_number = 'ABC010005'`,
    function (err, results, fields) {
      console.log(results); // results contains rows returned by server
      // console.log(fields); // fields contains extra meta data about results, if available
    }
  );
  res.send("ok");
});

router.get("/customerlist", (req, res) => {
  db.query(
    `SELECT CustomerID as id, CustomerID, Company_name_ch,BillingTel,Tier from master_db.customer`,
    (err, results, fields) => {
      res.json(results);
    }
  );
});

router.post("/createCustomer", async (req, res) => {
  const { DeliveryAddress, ...customerInfo } = req.body;
  try {
    const connection = await dbp.getConnection();
    try {
      await connection.beginTransaction();
      const result = await connection.query(
        `INSERT INTO master_db.customer (${Object.keys(
          customerInfo
        ).toString()}) VALUES (?)`,
        [Object.values(customerInfo)]
      );

      const shipToAddresses = DeliveryAddress.map((item, index) => ({
        ...item,
        CustomerID: result[0].insertId,
      }));

      shipToAddresses.map(async (item, index) => {
        await connection.query(
          `INSERT INTO master_db.customer_shipto (${Object.keys(
            item
          ).toString()}) VALUES (?)`,
          [Object.values(item)]
        );
      });

      await connection.commit();

      res.status(200).json({ status: "succss", insertId: result[0].insertId });
    } catch (err) {
      connection.rollback();
      connection.release();
      console.log(err);
      res.status(500).json(err);
    }
  } catch (err) {
    console.log(err);
    connection.rollback();
    connection.release();
  }
});

router.post("/getCustomer", (req, res) => {
  const customerInfo = `SELECT * FROM master_db.customer WHERE CustomerID = ${req.body.CustomerID}`;
  const customerShipTo = `SELECT * FROM master_db.customer_shipto WHERE CustomerID = ${req.body.CustomerID}`;
  const promisePool = db.promise();
  const customerProfile = promisePool.query(customerInfo);
  const customerShipTO = promisePool.query(customerShipTo);

  Promise.all([customerProfile, customerShipTO])
    .then((results) => {
      console.log(results);
      const customerData = {
        ...results[0][0][0],
        DeliveryAddress: results[1][0],
      };

      res.status(200).json(customerData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/deleteCustomer", (req, res) => {
  console.log(req.body.CustomerID);

  db.query(
    `DELETE FROM master_db.customer WHERE ID=${req.body.CustomerID}`,
    (err, result, field) => {
      if (err) {
        console.log(err);
      }
      res.send("ok delete");
    }
  );
});

router.post("/updateCustomerInfo", async (req, res) => {
  const { CustomerID, TimeStamp, ...Others } = req.body;
  console.log(Others);

  const time = await dbp.query(
    `SELECT TimeStamp FROM master_db.customer WHERE CustomerID=${CustomerID} `
  );

  if (time[0][0].TimeStamp !== TimeStamp) {
    res
      .status(250)
      .json(
        `changes are not saved, someone makes changes to Customer ID ${CustomerID} before you`
      );
    return;
  }

  const updateResult = await dbp.query(
    `UPDATE master_db.customer SET ? WHERE CustomerID = ${CustomerID}`,
    [Others]
  );

  console.log(updateResult);

  res.status(200).json("changes are saved ");
  const customerInfo = `UPDATE master_db.customer SET (req.)`;
});

router.post("/updateCustomerShipTO", async (req, res) => {
  const { CustomerShipToID, TimeStamp, ...Others } = req.body;
  console.log(Others);
  try {
    const time = await dbp.query(
      `SELECT TimeStamp FROM master_db.customer_shipto WHERE CustomerShipToID=${CustomerShipToID} `
    );

    if (time[0][0].TimeStamp !== TimeStamp) {
      res
        .status(250)
        .json(
          `changes are not saved, someone makes changes to SHIP_TO ID ${CustomerShipToID} before you`
        );
      return;
    }

    const updateResult = await dbp.query(
      `UPDATE master_db.customer_shipto SET ? WHERE CustomerShipToID = ${CustomerShipToID}`,
      [Others]
    );

    console.log(updateResult);

    res.status(200).json("changes are saved ");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/createShipTO", async (req, res) => {
  console.log(req.body);
  try {
    const result = await dbp.query(
      `INSERT INTO master_db.customer_shipto(${Object.keys(
        req.body
      ).toString()}) VALUES(?)`,
      [Object.values(req.body)]
    );
    console.log(result);
    res.status(200).json(`created ship-to ID : ${result[0].insertId}`);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
