const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.get("/supplierList", (req, res) => {
  db.query(`SELECT * FROM erp_db.supplier`, (err, result, field) => {
    if (err) {
      console.log(err);
      res.send("something went wrong");
      return;
    }
    console.log();
    res.json(result);
  });
});

router.post("/createSupplier", (req, res) => {
  const sql_fields = Object.keys(req.body).toString();
  const sql_values = Object.values(req.body);

  console.log(sql_values);
  db.query(
    `INSERT INTO erp_db.supplier (${sql_fields}) VALUES (?)`,
    [sql_values],
    (err, result, field) => {
      if (err) {
        console.log(err);
        res.send("something went wrong");
        return;
      }
      console.log();
      res.json({ status: "succss", insertId: result.insertId });
    }
  );
});

router.post("/deleteSupplier", (req, res) => {
  db.query(
    `DELETE FROM erp_db.supplier WHERE ID=${req.body.ID}`,
    (err, result, field) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.send("ok delete");
    }
  );
});

router.post("/updateSupplier", (req, res) => {
  let sqlStr = "UPDATE erp_db.supplier SET ";
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
    console.log(result);
    res.send("ok");
  });
});

module.exports = router;
