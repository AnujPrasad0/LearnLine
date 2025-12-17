const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controllers");
const validatorMiddleware = require("../middleware/validator.middleware");

router.post("/answer", subjectController.getAnswer);
router.post("/images", subjectController.getImage);
router.post("/marking", subjectController.getMarkingScheme);
router.post("/teacher/marking", subjectController.getTeacherMarkingScheme);
// router.post("/teacher/answer", subjectController.setTeacherMarkingScheme);
// router.post(
//   "/",
//   validatorMiddleware.registerValidationRules,
//   subjectController.createMemory
// );

module.exports = router;
