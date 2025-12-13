const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controllers");
const validatorMiddleware = require("../middleware/validator.middleware");

router.post("/answer", subjectController.getAnswer);
router.post("/image", subjectController.getImage);
// router.post(
//   "/",
//   validatorMiddleware.registerValidationRules,
//   subjectController.createMemory
// );

module.exports = router;
