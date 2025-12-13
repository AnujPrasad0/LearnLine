const { body, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const registerValidationRules = [
  body("url").isString().withMessage("Url must be a string"),
  body("subject").isString().withMessage("Invalid subject format"),
  body("className")
    .isString()
    .withMessage("Invalid class name format")
    .isLength({ min: 1 })
    .withMessage("Class name must be at least 1 character long"),
  validate,
];

module.exports = {
  registerValidationRules,
};
