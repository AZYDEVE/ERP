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

router.post("/insertTransaction", (req, res) => {
  console.log(req.body);
  const uniqueRef = new Date().valueOf();

  const transactionOut = {
    ...req.body.from,
    TransactionDate: new Date().toISOString().slice(0, 10),
    QTY: req.body.to.QTY * -1,
    TransactionType: req.body.TransactionType,
    Reference: uniqueRef,
  };

  delete transactionOut.PartNumber;

  const transactionIn = {
    ...req.body.to,
    TransactionDate: new Date().toISOString().slice(0, 10),
    TransactionType: req.body.TransactionType,
    Reference: uniqueRef,
  };

  delete transactionIn.PartNumber;

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        console.log(err);
        connection.release();
        throw err;
      }

      const outKey = Object.keys(transactionOut);
      const outValue = Object.values(transactionOut);

      console.log(outValue);
      connection.query(
        `INSERT INTO inventory_db.inventory_transaction (${outKey.toString()}) values (?)`,
        [outValue],
        (err, results, fields) => {
          if (err) {
            return connection.rollback(function () {
              console.log(err);
              connection.release();
              res.status(500).send(error);
              throw err;
            });
          }
          console.log(results);

          const inKey = Object.keys(transactionIn);
          const inValue = Object.values(transactionIn);
          connection.query(
            `INSERT INTO inventory_db.inventory_transaction (${inKey.toString()}) values (?)`,
            [inValue],
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return connection.rollback(function () {
                  connection.release();
                  res.status(500).send(error);
                  throw err;
                });
              }
              console.log(results);
              connection.commit(function (err) {
                if (err) {
                  console.log(err);
                  return connection.rollback(function () {
                    connection.release();
                    res.status(500).send(err);
                    throw err;
                  });
                } else {
                  connection.release();
                  res.status(200).json({ message: "Inserted Transactions " });
                  console.log("success!");
                }
              });
            }
          );
        }
      );
    });
  });
});
module.exports = router;
