const express = require("express");
const router = express.Router();
const history = require("../controllers/history.controllers");

router.get("/", history.historyAns);
router.post("/", history.historyText);

module.exports = router;
