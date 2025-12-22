const express = require("express");
const cors = require("cors");
const subjectRoutes = require("./routes/history.routes");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/history", subjectRoutes);

module.exports = app;
