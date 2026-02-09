const utilities = require("../utilities")
const accountModel = require("../models/accountModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver account view
* *************************************** */
async function accountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to access your account.")
    return res.redirect("/account/login")
  }
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
    account_id: accountData.account_id,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash('notice', `Congratulations ${account_firstname}, you're registered and can now log in.`);
      return res.redirect('/account/login');
    } else {
      req.flash('notice', 'Sorry, the registration failed.');
      return res.render('account/register', { nav, errors: null });
    }
  } catch (error) {
    return next(error);
  }
}


/* 
* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      req.session.accountData = accountData
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to access your account.")
    return res.redirect("/account/login")
  }
  const accountId = parseInt(req.params.accountId)
  if (Number.isNaN(accountId) || accountId !== accountData.account_id) {
    req.flash("notice", "You do not have permission to access that account.")
    return res.redirect("/account/")
  }
  const account = await accountModel.getAccountById(accountId)
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: account ? account.account_firstname : "",
    account_lastname: account ? account.account_lastname : "",
    account_email: account ? account.account_email : "",
    account_id: account ? account.account_id : accountId
  })
}

/* ****************************************
*  Handle account update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to access your account.")
    return res.redirect("/account/login")
  }
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const accountId = parseInt(account_id)
  if (Number.isNaN(accountId) || accountId !== accountData.account_id) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/")
  }
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    accountId
  )
  if (updateResult && updateResult.account_id) {
    const updatedAccount = await accountModel.getAccountById(accountId)
    req.session.accountData = updatedAccount
    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.flash("notice", "Account updated successfully.")
    return res.redirect("/account/")
  }
  req.flash("notice", "Sorry, the update failed.")
  return res.status(500).render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_id: accountId
  })
}

/* ****************************************
*  Handle password update
* *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = req.session.accountData || res.locals.accountData
  if (!accountData) {
    req.flash("notice", "Please log in to access your account.")
    return res.redirect("/account/login")
  }
  const accountId = parseInt(req.body.account_id)
  if (Number.isNaN(accountId) || accountId !== accountData.account_id) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/")
  }
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(req.body.account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the password.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountId
    })
  }
  const updateResult = await accountModel.updatePassword(hashedPassword, accountId)
  if (updateResult && updateResult.account_id) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  }
  req.flash("notice", "Sorry, the password update failed.")
  return res.redirect("/account/")
}

/* ****************************************
*  Logout account
* *************************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")
  if (req.session) {
    req.session.destroy(() => {
      return res.redirect("/")
    })
    return
  }
  return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, accountManagement, registerAccount, accountLogin, buildUpdateAccount, updateAccount, updatePassword, accountLogout }
