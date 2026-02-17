const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")

const validate = {}

/* ******************************
 * Favorite data validation rules
 * ***************************** */
validate.favoriteRules = () => {
  return [
    body("inv_id")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Invalid inventory item."),
  ]
}

/* ******************************
 * Check favorite data
 * ***************************** */
validate.checkFavoriteData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    req.flash("notice", "Please select a valid inventory item.")
    return res.status(400).render("account/favorites", {
      title: "My Favorites",
      nav,
      errors,
      favorites: []
    })
  }
  next()
}

module.exports = validate
