require("dotenv").config();
const mysql = require("mysql2");
const pool = mysql.createPool({
  connectionLimit: 99,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  multipleStatements: true,
  dateStrings: true,

  // database: process.env.DATABASE,
});

module.exports = { connection: pool, connectionPromist: pool.promise() };
