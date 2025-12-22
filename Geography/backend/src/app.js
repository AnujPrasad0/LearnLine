const express = require("express");
const cors = require("cors");
const geographyRoutes = require("./routes/geography.routes");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/geography", geographyRoutes);

module.exports = app;
