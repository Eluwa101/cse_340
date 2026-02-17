const pool = require("../database")

/* ***************************
 *  Add favorite
 * ************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql =
      "INSERT INTO account_favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("addFavorite error: " + error)
    return null
  }
}

/* ***************************
 *  Remove favorite
 * ************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = "DELETE FROM account_favorites WHERE account_id = $1 AND inv_id = $2"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rowCount
  } catch (error) {
    console.error("removeFavorite error: " + error)
    return null
  }
}

/* ***************************
 *  Check if favorite exists
 * ************************** */
async function checkFavorite(account_id, inv_id) {
  try {
    const sql = "SELECT favorite_id FROM account_favorites WHERE account_id = $1 AND inv_id = $2"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("checkFavorite error: " + error)
    return null
  }
}

/* ***************************
 *  Get favorites by account
 * ************************** */
async function getFavoritesByAccountId(account_id) {
  try {
    const sql =
      "SELECT f.favorite_id, i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail " +
      "FROM account_favorites f " +
      "JOIN inventory i ON f.inv_id = i.inv_id " +
      "WHERE f.account_id = $1 " +
      "ORDER BY f.favorite_id DESC"
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getFavoritesByAccountId error: " + error)
    return []
  }
}

/* ***************************
 *  Get favorites count by account
 * ************************** */
async function getFavoriteCountByAccountId(account_id) {
  try {
    const sql = "SELECT COUNT(*) AS count FROM account_favorites WHERE account_id = $1"
    const data = await pool.query(sql, [account_id])
    return parseInt(data.rows[0].count, 10)
  } catch (error) {
    console.error("getFavoriteCountByAccountId error: " + error)
    return 0
  }
}

module.exports = { addFavorite, removeFavorite, checkFavorite, getFavoritesByAccountId, getFavoriteCountByAccountId }
