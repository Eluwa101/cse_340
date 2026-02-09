const { body, validationResult } = require('express-validator');
const invModel = require('../models/inventory-model');

// Validation rules for inventory
const validateInventory = [
  body('classification_id')
    .notEmpty()
    .withMessage('Classification is required.')
    .isInt()
    .withMessage('Invalid classification selected.'),
  
  body('inv_make')
    .trim()
    .notEmpty()
    .withMessage('Make is required.')
    .isLength({ min: 3 })
    .withMessage('Make must be at least 3 characters long.'),
  
  body('inv_year')
    .notEmpty()
    .withMessage('Year is required.')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Year must be between 1900 and 2100.'),
  
  body('inv_model')
    .trim()
    .notEmpty()
    .withMessage('Model is required.')
    .isLength({ min: 3 })
    .withMessage('Model must be at least 3 characters long.'),
  
  body('inv_description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),
  
  body('inv_image')
    .trim()
    .notEmpty()
    .withMessage('Image path is required.'),
  
  body('inv_thumbnail')
    .trim()
    .notEmpty()
    .withMessage('Thumbnail path is required.'),
  
  body('inv_price')
    .notEmpty()
    .withMessage('Price is required.')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid number greater than 0.'),
  
  body('inv_miles')
    .notEmpty()
    .withMessage('Miles is required.')
    .isInt({ min: 0 })
    .withMessage('Miles must be a valid whole number.'),
  
  body('inv_color')
    .trim()
    .notEmpty()
    .withMessage('Color is required.')
    .isLength({ min: 3 })
    .withMessage('Color must be at least 3 characters long.'),
];


// Validation rules for inventory Update
const newInventoryRules = [
  body('inv_id')
    .notEmpty()
    .withMessage('Inventory ID is required.')
    .isInt()
    .withMessage('Invalid inventory ID.'),

  body('classification_id')
    .notEmpty()
    .withMessage('Classification is required.')
    .isInt()
    .withMessage('Invalid classification selected.'),
  
  body('inv_make')
    .trim()
    .notEmpty()
    .withMessage('Make is required.')
    .isLength({ min: 3 })
    .withMessage('Make must be at least 3 characters long.'),
  
  body('inv_year')
    .notEmpty()
    .withMessage('Year is required.')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Year must be between 1900 and 2100.'),
  
  body('inv_model')
    .trim()
    .notEmpty()
    .withMessage('Model is required.')
    .isLength({ min: 3 })
    .withMessage('Model must be at least 3 characters long.'),
  
  body('inv_description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),
  
  body('inv_image')
    .trim()
    .notEmpty()
    .withMessage('Image path is required.'),
  
  body('inv_thumbnail')
    .trim()
    .notEmpty()
    .withMessage('Thumbnail path is required.'),
  
  body('inv_price')
    .notEmpty()
    .withMessage('Price is required.')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid number greater than 0.'),
  
  body('inv_miles')
    .notEmpty()
    .withMessage('Miles is required.')
    .isInt({ min: 0 })
    .withMessage('Miles must be a valid whole number.'),
  
  body('inv_color')
    .trim()
    .notEmpty()
    .withMessage('Color is required.')
    .isLength({ min: 3 })
    .withMessage('Color must be at least 3 characters long.'),
];

// Middleware to check validation results
const handleInventoryValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require('./index').getNav();
    let buildClassificationList = require('./index').buildClassificationList;
    let classificationList = await buildClassificationList(req.body.classification_id);
    
    res.status(400).render('./inventory/add-inventory', {
      title: 'Add Vehicle',
      nav,
      classificationList,
      errors,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    });
    return;
  }
  next();
};



// Middleware to check validation results, errors directed to edit view
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require('./index').getNav();
    let buildClassificationList = require('./index').buildClassificationList;
    let classificationList = await buildClassificationList(req.body.classification_id);
    
    res.status(400).render('./inventory/edit-inventory', {
      title: 'Edit Vehicle',
      nav,
      classificationList,
      errors,
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    });
    return;
  }
  next();
};


module.exports = { newInventoryRules, handleInventoryValidationErrors, checkUpdateData, validateInventory };