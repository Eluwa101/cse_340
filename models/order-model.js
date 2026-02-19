const pool = require("../database")

async function createOrder({ inv_id, customer_name, customer_phone, delivery_address, quantity }) {
  const sql = `INSERT INTO public.food_order (
    inv_id, customer_name, customer_phone, delivery_address, quantity
  ) VALUES ($1, $2, $3, $4, $5) RETURNING *`

  const data = await pool.query(sql, [
    inv_id,
    customer_name,
    customer_phone,
    delivery_address,
    quantity,
  ])

  return data.rows[0]
}

module.exports = { createOrder }
