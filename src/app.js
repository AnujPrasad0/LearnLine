const express = require("express");
const historyRoutes = require("./routes/history.routes");
const app = express();
app.use(express.json());

app.use("/api/history", historyRoutes);

module.exports = app;
