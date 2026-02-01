/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const bodyParser = require("body-parser")
const pool = require("./database/")
const session = require("express-session")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoutes") 
const accountRoute = require("./routes/accountRoute")
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")


/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})



/* ***********************
 * View Engine and templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") //not at the root of views folder


/* ***********************
 * Routes
 *************************/
app.use(static)

/***********************
 * index route
 * ***********************/
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory route
app.use("/inv", utilities.handleErrors(inventoryRoute))

// Account route
app.use("/account", utilities.handleErrors(accountRoute))



// File Not Found Route - must be the last route in the list
app.use(async (req, res, next) => {
  next ({ status: 404, message: `Sorry, we couldn't find this page.` })
})


/** *********************** 
 * Express Error Handler
 * Place after all other middleware and routes
  *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
