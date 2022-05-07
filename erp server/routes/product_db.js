const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.get("/productList", (req, res) => {
  db.query(`SELECT * FROM master_db.product`, (err, result, field) => {
    if (err) {
      console.log(err);
      res.send("something went wrong");
      return;
    }
    console.log();
    res.json(result);
  });
});

router.post("/createProduct", (req, res) => {
  const sql_fields = Object.keys(req.body).toString();
  const sql_values = Object.values(req.body);

  console.log(sql_values);
  db.query(
    `INSERT INTO master_db.product (${sql_fields}) VALUES (?)`,
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

router.post("/deleteProduct", (req, res) => {
  console.log(req.body.id);
  db.query(
    `DELETE FROM master_db.product WHERE ProductID=${req.body.ProductID}`,
    (err, result, field) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.send("ok delete");
    }
  );
});

router.post("/updateProduct", (req, res) => {
  let sqlStr = "UPDATE master_db.product SET ";
  Object.keys(req.body).map((key, index) => {
    if (key !== "ProductID" && req.body[key] !== null) {
      sqlStr += key + `= "${req.body[key]}",`;
    }

    if (req.body[key] === null) {
      sqlStr += key + "=null,";
    }
  });

  sqlStr = sqlStr.slice(0, -1) + ` Where ProductID=${req.body.ID}`;

  db.query(sqlStr, (err, result, feild) => {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.send("ok");
  });
});

module.exports = router;
