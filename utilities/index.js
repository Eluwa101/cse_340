const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Create the nav unordered list
Util.getNav = async function (req, res, next) {
let data = await invModel.getClassifications()
let list = "<ul>"
list += '<li><a href="/" title="Home Page">Home</a></li>'
data.rows.forEach((row) => {
    list += "<li>"
    list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
    list += "</li>"
} )
list += "</ul>"
return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* 
Build the vehicle detail view HTML
* ***************************** */
Util.buildVehicleDetailView = async function(data){
  let detailView = '<div class="vehicle-detail-view">'
  detailView += '<img src="' + data.inv_image + '" alt="Image of ' + data.inv_make + ' ' + data.inv_model + ' on CSE Motors" />'
  detailView += '<div class="vehicle-details-info">'
  detailView += '<h2>' + data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model + '</h2>'
  detailView += '<p><strong>Year:</strong> ' + data.inv_year + '</p>'
  detailView += '<p><strong>Price:</strong> $' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</p>'
  detailView += '<p><strong>Description:</strong> ' + data.inv_description + '</p>'
  detailView += '<p><strong>Miles:</strong> ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</p>'
  detailView += '<p><strong>Color:</strong> ' + data.inv_color + '</p>'
  detailView += '</div>'
  detailView += '</div>'
  return detailView
}


/* ***************************
* Build the classification select list
* ************************** */

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}



/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in.")
     res.clearCookie("jwt")
     res.locals.loggedin = 0
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  res.locals.loggedin = 0
  next()
 }
}

/* ******************************
* Middleware to check login
* ***************************** */
Util.checkLogin = (req, res, next) => {
  if (req.session.accountData || res.locals.loggedin) {
    return next()
  }
  req.flash("notice", "Please log in to access your account.")
  return res.redirect("/account/login")
}

/* ******************************
* Middleware to check account type
* ***************************** */
Util.checkAccountType = async (req, res, next) => {
  try {
    const accountData = req.session.accountData || res.locals.accountData
    if (!accountData) {
      const nav = await Util.getNav()
      req.flash("notice", "Please log in.")
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: ""
      })
    }
    const accountType = (accountData.account_type || "").toLowerCase()
    if (accountType === "employee" || accountType === "admin") {
      return next()
    }
    const nav = await Util.getNav()
    req.flash("notice", "You do not have permission to access that resource.")
    return res.status(403).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: accountData.account_email || ""
    })
  } catch (error) {
    return next(error)
  }
}

/* ******************************
* Middleware to set favorites count
* ***************************** */
Util.setFavoritesCount = async (req, res, next) => {
  try {
    const accountData = req.session.accountData || res.locals.accountData
    if (!accountData) {
      res.locals.favoritesCount = 0
      return next()
    }
    const favoriteModel = require("../models/favorite-model")
    const count = await favoriteModel.getFavoriteCountByAccountId(accountData.account_id)
    res.locals.favoritesCount = count || 0
    return next()
  } catch (error) {
    res.locals.favoritesCount = 0
    return next()
  }
}


/* ******************************
* Middleware for handling Errors
Wrap other functions in this for
general error handling
* ******************************/
Util.handleErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = Util
