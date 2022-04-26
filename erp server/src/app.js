const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require(".././routes/index");
const customer_routes = require("../routes/customer_db");
const supplier_routes = require("../routes/supplier_db");
const product_routes = require("../routes/product_db");
const po_routes = require("../routes/po_db");
const receiving_routes = require("../routes/receiving_db");
const inventory = require("../routes/inventory_db");
const app = express();

const cors = require("cors");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/customer", customer_routes);
app.use("/supplier", supplier_routes);
app.use("/product", product_routes);
app.use("/receive", receiving_routes);
app.use("/po", po_routes);
app.use("/inventory", inventory);

module.exports = app;
