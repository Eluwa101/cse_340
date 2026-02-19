const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const handleErrors = require("../utilities").handleErrors
const { validateClassification, handleValidationErrors } = require('../utilities/classification-validation')
const { validateInventory, handleInventoryValidationErrors, newInventoryRules, checkUpdateData } = require('../utilities/inventory-validation')
const invModel = require("../models/inventory-model")
const { check } = require("express-validator")


// Route to build inventory management
router.get("/", utilities.checkAccountType, handleErrors(invController.buildManagementView))

// Add classification routes
router.get("/add-classification", utilities.checkAccountType, handleErrors(invController.buildAddClassificationView))
router.post("/add-classification", utilities.checkAccountType, validateClassification, handleValidationErrors, utilities.handleErrors(invController.addClassification))

// Add inventory routes
router.get("/add-inventory", utilities.checkAccountType, handleErrors(invController.buildAddInventory));
router.post("/add-inventory", utilities.checkAccountType, validateInventory, handleInventoryValidationErrors, utilities.handleErrors(invController.addInventory))

// Route to build inventory by classifcication view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId))

// Route to build inventory by vehicle detail view
router.get("/detail/:invId", handleErrors(invController.buildByVehicleId))

// Route to place a food order
router.post("/order/:invId", handleErrors(invController.createOrder))

// Route to intentionally trigger a 500 error
router.get("/error", handleErrors(invController.triggerError))

// Route to return the data as JSON for the inventory items in a classification
router.get("/getInventory/:classificationId", utilities.checkAccountType, handleErrors(invController.getInventoryJSON))

// Routes for edit/delete
router.get("/edit/:invId", utilities.checkAccountType, handleErrors(invController.buildEditInventory))
router.get("/delete/:invId", utilities.checkAccountType, handleErrors(invController.buildDeleteInventory))

// Route to handle the update inventory form submission
router.post("/update", utilities.checkAccountType, newInventoryRules, checkUpdateData, utilities.handleErrors(invController.updateInventory))

// Route to handle the delete inventory form submission
router.post("/delete", utilities.checkAccountType, handleErrors(invController.deleteInventory))

module.exports = router;
