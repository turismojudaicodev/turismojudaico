import mysql from 'mysql2'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'paiput',
  database: 'turismojudaico-strapi',
  password: 'Strapi123',
})

const promisePool = pool.promise()

export { promisePool as db }
