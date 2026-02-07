const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const handleErrors = require("../utilities").handleErrors
const regValidate = require("../utilities/account-validation")

// Route to deliver the account login view
router.get("/login", handleErrors(accountController.buildLogin))

// Route to deliver the register view
router.get(
  "/register",
  handleErrors(accountController.buildRegister)
)

// Route to handle the POST register form submission
router.post("/register", regValidate.registationRules(), regValidate.checkRegData, handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
  "/login", 
  regValidate.loginRules(), 
  regValidate.checkLoginData,
  handleErrors(accountController.accountLogin)
)

// default route for accounts
router.get("/", utilities.checkLogin, handleErrors(accountController.accountManagement))

module.exports = router;
