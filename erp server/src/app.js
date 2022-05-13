const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const customer_routes = require("../routes/customer_db");
const supplier_routes = require("../routes/supplier_db");
const product_routes = require("../routes/product_db");
const po_routes = require("../routes/po_db");
const receiving_routes = require("../routes/receiving_db");
const inventory = require("../routes/inventory_db");
const salesOrder = require("../routes/salesOrder_db");
const delivery = require("../routes/delivery_db");
const app = express();

const cors = require("cors");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/customer", customer_routes);
app.use("/supplier", supplier_routes);
app.use("/product", product_routes);
app.use("/receive", receiving_routes);
app.use("/po", po_routes);
app.use("/inventory", inventory);
app.use("/salesOrder", salesOrder);
app.use("/delivery", delivery);

module.exports = app;
