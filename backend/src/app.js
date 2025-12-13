const express = require("express");
const cors = require("cors");
const subjectRoutes = require("./routes/subject.routes");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/subject", subjectRoutes);

module.exports = app;
