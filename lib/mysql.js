import mysql from 'mysql2'

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 20,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

/** Ejecuta una consulta con promesas y devuelve solo las filas/resultado. */
async function query(sql, params = []) {
  const [result] = await db.promise().query(sql, params)
  return result
}

export { db, query }
