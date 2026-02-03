const { body, validationResult } = require('express-validator');
const invModel = require('../models/inventory-model');

// Validation rules for classification
const validateClassification = [
  body('classificationName')
    .trim()
    .notEmpty()
    .withMessage('Classification name is required.')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Classification name cannot contain spaces or special characters.')
    .custom(async (value) => {
      const existingClass = await invModel.getClassificationByName(value);
      if (existingClass) {
        throw new Error(`Classification "${value}" already exists.`);
      }
    }),
];

// Middleware to check validation results
const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require('./index').getNav();
    res.status(400).render('./inventory/add-classification', {
      title: 'Add Classification',
      nav,
      classificationName: req.body.classificationName,
      errors,
    });
    return;
  }
  next();
};

module.exports = { validateClassification, handleValidationErrors };