const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

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
  db.query(`SELECT * from master_db.customer`, (err, results, fields) => {
    res.json(results);
  });
});

router.post("/createCustomer", (req, res) => {
  const sql_fields = Object.keys(req.body).toString();
  const sql_values = Object.values(req.body);

  console.log(sql_values);
  db.query(
    `INSERT INTO master_db.customer (${sql_fields}) VALUES (?)`,
    [sql_values],

    (err, result, fields) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.json({ status: "succss", insertId: result.insertId });
    }
  );
});

router.post("/deleteCustomer", (req, res) => {
  console.log(req.body.id);

  db.query(
    `DELETE FROM master_db.customer WHERE ID=${req.body.ID}`,
    (err, result, field) => {
      if (err) {
        console.log(err);
      }
      res.send("ok delete");
    }
  );
});

router.post("/updateCustomer", (req, res) => {
  let sqlStr = "UPDATE master_db.customer SET ";
  Object.keys(req.body).map((key, index) => {
    if (key !== "ID" && req.body[key] !== null) {
      sqlStr += key + `= "${req.body[key]}",`;
    }

    if (req.body[key] === null) {
      sqlStr += key + "=null,";
    }
  });

  sqlStr = sqlStr.slice(0, -1) + ` Where ID=${req.body.ID}`;

  db.query(sqlStr, (err, result, feild) => {
    if (err) {
      console.log(err);
    }

    res.send("ok");
  });
});

module.exports = router;
