const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require(".././routes/index");
const customer_routes = require("../routes/customer_db");
const supplier_routes = require("../routes/supplier_db");
const product_routes = require("../routes/product_db");
const app = express();

const cors = require("cors");

app.use(logger("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/customer", customer_routes);
app.use("/supplier", supplier_routes);
app.use("/product", product_routes);

module.exports = app;
