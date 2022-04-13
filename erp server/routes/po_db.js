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
            product.customer.ID,
            product.remark,
          ]);
          console.log(poDetail);

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

router.get("/getListOpenPo", (req, res) => {
  const sqlStr = `SELECT p.poID as "id" , DATE_FORMAT(p.poDate, "%Y.%M.%d" ) as "Po Date",p.VendorId as "Vendor ID", s.Company_name_ch as "Company Name", p.Remark,sum(pd.QTY * pd.UnitCost) as "Total cost" , p.Status as Status
  FROM po_db.po AS p 
  join master_db.supplier as s 
  join po_db.po_detail as pd  
  where p.vendorId = s.ID and p.poID= pd.poID And p.status in ("open","partial") 
  group by p.poID`;

  db.query(sqlStr, function (err, results, fields) {
    if (err) {
      res.status(500).json(err);
      console.log(err);
    }
    res.status(200).json(results);
  });
});

router.post("/getpo", async (req, res) => {
  const param = req.body;
  console.log(param);
  const sqlPoStr = `SELECT VendorID,PoDate,Tel,Fax,ContactPerson,Currency,Company_name_ch,Address,Zip_code,po.Remark FROM (SELECT * FROM master_db.supplier as S WHERE S.ID = ${param.vendorID}) AS supplierDetail
    JOIN (SELECT * FROM po_db.po as P WHERE P.poID =${param.poID}) As po 
    WHERE supplierDetail.ID = po.VendorID`;

  // const sqlStrPoDetail = `SELECT * FROM master_db.product as pro
  // JOIN (SELECT * FROM po_db.po_detail AS pd where pd.poID =${param.poID})as a  where pro.ID = a.ProductID `;

  const sqlStrPoDetail = `SELECT JSON_OBJECT("PartNumber", pro.PartNumber , "ID", pro.ID, "description", pro.description, "VendorNumber", pro.VendorNumber, "Cost", pro.Cost, "Price", pro.Price, "Remark", pro.Remark) as product , 
  JSON_OBJECT("ID", customer.ID, "Company_name_ch", customer.Company_name_ch) as customer,
  JSON_OBJECT("value",Application) as Application,JSON_OBJECT("value",BurnOption) as BurnOption,ETD, JSON_OBJECT("value",Packaging) as Packaging,QTY, JSON_OBJECT("value",UnitMeasure) as UnitMeasure,UnitCost  FROM master_db.product as pro 
    JOIN (SELECT * FROM po_db.po_detail AS pd where pd.poID =${param.poID})as podetail 
    JOIN (SELECT * FROM master_db.customer ) as customer
    where pro.ID = podetail.ProductID and  customer.ID = podetail.CustomerID`;

  const promisePool = db.promise();
  const customer = promisePool.query(sqlPoStr);
  const podetail = promisePool.query(sqlStrPoDetail);

  Promise.all([customer, podetail]).then((results) => {
    const poInfo = { ...results[0][0][0], orderProduct: results[1][0] };
    console.log(poInfo);
    res.status(200).json(poInfo);
  });
});

router.post("/deletePo", (req, res) => {
  const sql_delete_podetail = `DELETE  FROM  po_db.po_detail  WHERE poID=${req.body.ID}`;
  const sql_delete_po = `DELETE FROM  po_db.po  WHERE poID=${req.body.ID}`;

  db.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      connection.query(sql_delete_podetail, function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            connection.release();
            throw error;
          });
        }

        console.log(results);

        connection.query(sql_delete_po, function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              connection.release();
              throw error;
            });
          }
          connection.commit(function (err) {
            if (err) {
              return connection.rollback(function () {
                connection.release();
                throw err;
              });
            }
            res.status(200).json({ message: "success" });
          });
        });
      });
    });
  });
});

router.post("/update", (req, res) => {});

module.exports = router;
