const express = require("express");
const cookieparser = require("cookie-parser");
const mainRoutes = require("./routes/mainRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser())

app.use("/api", mainRoutes);

app.use("/", express.static('public'));


module.exports = app;