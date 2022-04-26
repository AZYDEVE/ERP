const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.get("/inventoryList", (req, res) => {
  db.query(
    "SELECT * FROM inventory_db.inventory_onhand",
    (err, results, fields) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      }

      console.log(results);
      res.status(200).json(results);
    }
  );
});

module.exports = router;
