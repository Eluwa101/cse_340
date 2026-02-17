const { validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const favoriteModel = require("../models/favorite-model")
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
  let favoriteExists = false
  const accountData = req.session.accountData || res.locals.accountData
  if (accountData) {
    const favorite = await favoriteModel.checkFavorite(accountData.account_id, data.inv_id)
    favoriteExists = !!favorite
  }
  res.render("./inventory/detail", {
    title: data.inv_make + " " + data.inv_model,
    nav,
    vehicle: data,
    favoriteExists,
    inv_id: data.inv_id,
    errors: null
  })
}

/* 
  *  Build inventory management view
  * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationList
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
 *  Insert a new Inventory Item
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
 *  Update Inventory Item
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classificationId)
  if (Number.isNaN(classification_id)) {
    return res.status(400).json([])
  }
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData.length > 0) {
    return res.json(invData)
  }
  return res.json([])
}

/* ***************************
 *  Handle edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.invId)
  const data = await invModel.getInventoryItemById(inv_id)
  const classificationList = await utilities.buildClassificationList(data ? data.classification_id : null)
  const itemName = data ? `${data.inv_make} ${data.inv_model}` : "Vehicle"
  if (!data) {
    return next({ status: 404, message: `${itemName} not found` })
  }
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_description: data.inv_description,
    inv_image: data.inv_image,
    inv_thumbnail: data.inv_thumbnail,
    inv_price: data.inv_price,
    inv_miles: data.inv_miles,
    inv_color: data.inv_color,
    classification_id: data.classification_id,
    errors: null
  })
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.invId)
  const data = await invModel.getInventoryItemById(inv_id)
  const itemName = data ? `${data.inv_make} ${data.inv_model}` : "Vehicle"
  if (!data) {
    return next({ status: 404, message: `${itemName} not found` })
  }
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_price: data.inv_price
  })
}

/* ***************************
 *  Carry out inventory deletion
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid inventory item.")
    return res.redirect("/inv/")
  }
  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  if (deleteResult && deleteResult.rowCount > 0) {
    req.flash("notice", "The inventory item was deleted.")
    return res.redirect("/inv/")
  }
  req.flash("notice", "Sorry, the delete failed.")
  return res.redirect(`/inv/delete/${inv_id}`)
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
