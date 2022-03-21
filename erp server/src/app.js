let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let indexRouter = require(".././routes/index");
let usersRouter = require(".././routes/users");
let apiRouter = require("../routes/api/db_operations");
let app = express();
let db = require("./db/conn");
let cors = require("cors");

app.use(logger("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);

module.exports = app;
