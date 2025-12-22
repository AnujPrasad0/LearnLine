const express = require("express");
const router = express.Router();
const historyController = require("../controllers/history.controllers");
const validatorMiddleware = require("../middleware/validator.middleware");

router.post("/answer", historyController.getAnswer);
router.post("/answer/images", historyController.getImage);
router.post("/answer/marking/ai", historyController.getMarkingScheme);
router.post(
  "/answer/marking/teacher",
  historyController.getTeacherMarkingScheme
);
router.post("/answer/teacher", historyController.setTeacherMarkingScheme);
// router.post(
//   "/memory",
//   validatorMiddleware.registerValidationRules,
//   historyController.createMemory
// );

module.exports = router;
