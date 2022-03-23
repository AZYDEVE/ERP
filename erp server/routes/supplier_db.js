const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.get("/supplierList", (req, res) => {
  db.query(`SELECT * FROM supplier`, (err, result, field) => {
    res.json(result);
  });
});

module.exports = router;
