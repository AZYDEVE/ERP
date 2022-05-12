require("dotenv").config();
const db = require("mysql2");
const connection = db.createPool({
  connectionLimit: 99,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  multipleStatements: true,
  // database: process.env.DATABASE,
});

module.exports = connection;
