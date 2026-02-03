const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const handleErrors = require("../utilities").handleErrors
const { validateClassification, handleValidationErrors } = require('../utilities/classification-validation')
const { validateInventory, handleInventoryValidationErrors } = require('../utilities/inventory-validation')
const invModel = require("../models/inventory-model")


// Route to build inventory management
router.get("/", handleErrors(invController.buildManagementView))

// Add classification routes
router.get("/add-classification", handleErrors(invController.buildAddClassificationView))
router.post("/add-classification", validateClassification, handleValidationErrors, utilities.handleErrors(invController.addClassification))

// Add inventory routes
router.get("/add-inventory", handleErrors(invController.buildAddInventory));
router.post("/add-inventory", validateInventory, handleInventoryValidationErrors, utilities.handleErrors(invController.addInventory))

// Route to build inventory by classifcication view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId))

// Route to build inventory by vehicle detail view
router.get("/detail/:invId", handleErrors(invController.buildByVehicleId))

// Route to intentionally trigger a 500 error
router.get("/error", handleErrors(invController.triggerError))

module.exports = router;