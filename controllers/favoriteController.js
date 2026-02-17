const favoriteModel = require("../models/favorite-model")
const utilities = require("../utilities")

const favController = {}

/* ***************************
 *  Build favorites view
 * ************************** */
favController.buildFavorites = async function (req, res, next) {
  const nav = await utilities.getNav()
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to view favorites.")
    return res.redirect("/account/login")
  }
  const favorites = await favoriteModel.getFavoritesByAccountId(accountData.account_id)
  res.render("account/favorites", {
    title: "My Favorites",
    nav,
    errors: null,
    favorites
  })
}

/* ***************************
 *  Add favorite
 * ************************** */
favController.addFavorite = async function (req, res, next) {
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to save favorites.")
    return res.redirect("/account/login")
  }
  const inv_id = parseInt(req.body.inv_id)
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid inventory item.")
    return res.redirect("/account/favorites")
  }

  const existing = await favoriteModel.checkFavorite(accountData.account_id, inv_id)
  const safeReturnTo = (typeof req.body.returnTo === "string" && req.body.returnTo.startsWith("/"))
    ? req.body.returnTo
    : "/account/favorites"
  if (existing) {
    req.flash("notice", "That vehicle is already in your favorites.")
    return res.redirect(safeReturnTo)
  }

  const result = await favoriteModel.addFavorite(accountData.account_id, inv_id)
  if (result) {
    req.flash("notice", "Vehicle added to favorites.")
    return res.redirect(safeReturnTo)
  }
  req.flash("notice", "Sorry, we could not save that favorite.")
  return res.redirect(safeReturnTo)
}

/* ***************************
 *  Remove favorite
 * ************************** */
favController.removeFavorite = async function (req, res, next) {
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to manage favorites.")
    return res.redirect("/account/login")
  }
  const inv_id = parseInt(req.body.inv_id)
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid inventory item.")
    return res.redirect("/account/favorites")
  }
  const result = await favoriteModel.removeFavorite(accountData.account_id, inv_id)
  if (result && result > 0) {
    req.flash("notice", "Favorite removed.")
    return res.redirect("/account/favorites")
  }
  req.flash("notice", "Sorry, the favorite could not be removed.")
  return res.redirect("/account/favorites")
}

module.exports = favController
