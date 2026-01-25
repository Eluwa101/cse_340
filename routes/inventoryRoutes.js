const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const handleErrors = require("../utilities").handleErrors

// Route to build inventory by classifcication view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId))

// Route to build inventory by vehicle detail view
router.get("/detail/:invId", handleErrors(invController.buildByVehicleId))

// Route to intentionally trigger a 500 error
router.get("/error", handleErrors(invController.triggerError))

module.exports = router;