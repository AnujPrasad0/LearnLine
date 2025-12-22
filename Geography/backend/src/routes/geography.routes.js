const express = require("express");
const router = express.Router();
const geographyController = require("../controllers/geography.controllers");

router.post("/answer", geographyController.getAnswer);
router.post("/answer/map", geographyController.getAnswer);
router.post("/answer/images", geographyController.getImage);
router.post("/answer/marking/ai", geographyController.getMarkingScheme);
router.post(
  "/answer/marking/teacher",
  geographyController.getTeacherMarkingScheme
);
router.post("/answer/teacher", geographyController.setTeacherMarkingScheme);
router.post("/memory", geographyController.createMemory);

module.exports = router;
