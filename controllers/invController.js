const { validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  if (!data || data.length === 0) {
    return next({ status: 404, message: "Classification not found" })
  }
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null
  })
}


/* ***************************
 *  Build inventory by vehicle detailview
 * ************************** */
invCont.buildByVehicleId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryItemById(inv_id)
  let nav = await utilities.getNav()
  if (!data) {
    return next({ status: 404, message: "Vehicle not found" })
  }
  const detailView = await utilities.buildVehicleDetailView(data)
  res.render("./inventory/detail", {
    title: data.inv_make + " " + data.inv_model,
    nav,
    detailView,
    errors: null
  })
}

/* 
  *  Build inventory management view
  * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null
  })
}


/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    classificationName: "",
    errors: null
  })
}

/* ***************************
 *  Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classificationName } = req.body
  const addClassResult = await invModel.addClassification(classificationName)
  if (addClassResult) {
    req.flash("notice", `Classification "${classificationName}" added successfully!`)
    return res.redirect("/inv/")
  } else {
    const error = new Error("Failed to add classification.")
    error.status = 400
    return next(error)
  }
}


/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
    errors: null
  })
}


/* ***************************
 *  Process new Inventory Item
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  const addInvResult = await invModel.addInventory({
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  })
  if (addInvResult) {
    req.flash("notice", `Vehicle "${inv_make} ${inv_model}" added successfully!`)
    return res.redirect("/inv")
  } else {
    const error = new Error("Failed to add vehicle to inventory.")
    error.status = 400
    return next(error)
  }
}


/* ***************************
 *  Intentional Error Trigger
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  const error = new Error("This is an intentional 500-type error for testing!")
  error.status = 500
  next(error)
}

module.exports = invCont
