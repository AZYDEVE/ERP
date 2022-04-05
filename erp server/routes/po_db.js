const express = require("express");
const router = express.Router();
const db = require("../src/db/conn");

router.post("/createPo", (req, res) => {
  const values = req.body;
  const PoInfo = {
    VendorID: values.ID,
    ContactPerson: values.ContactPerson,
    Currency: values.Currency,
    poDate: values.PoDate,
    Remark: values.Remark,
    Status: "open",
  };

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      const PoDetailkeys = Object.keys(PoInfo);
      const PoDetailValue = Object.values(PoInfo);
      connection.query(
        `INSERT INTO po_db.po (${PoDetailkeys.toString()}) VALUES(?)`,
        [PoDetailValue],
        function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }

          const insertPoID = results.insertId;
          const podetailKeys = `(poID,Application,BurnOption,ETD,Packaging,ProductID,QTY,UnitCost,UnitMeasure,CustomerID,Remark)`;

          const poDetail = values.orderProduct.map((product, index) => [
            insertPoID,
            product.Application.value,
            product.BurnOption.value,
            product.ETD,
            product.Packaging.value,
            product.product.ID,
            product.QTY,
            product.UnitCost,
            product.unitMeasure.value,
            product.customer.Id,
            product.remark,
          ]);

          connection.query(
            `INSERT INTO po_db.po_detail ${podetailKeys} VALUES ?`,
            [poDetail],
            function (error, results, fields) {
              if (error) {
                return connection.rollback(function () {
                  connection.release();
                  res.status(500).send(error);
                  throw error;
                });
              }
              connection.commit(function (err) {
                if (err) {
                  return connection.rollback(function () {
                    connection.release();
                    res.status(500).send(err);
                    throw err;
                  });
                } else {
                  connection.release();
                  res.status(200).json({ data: insertPoID });
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
