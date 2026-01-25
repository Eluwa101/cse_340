const { Pool } = require("pg")
require("dotenv").config()

let pool

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

    // added for troubleshooting 
    // queries during development
    // However, when we work in a remote production server,
    //  the ssl lines must not exist. This is because our application
    //  server and the database server will be in the same system and
    //  their communication will be secure
  // Export wrapped query for debugging
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }

} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  module.exports = pool
}
