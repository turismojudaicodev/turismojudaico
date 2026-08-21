import { db } from '../../../../lib/mysql'

export default async function handler(req, res) {
  const query = (sql) => {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err)
        else resolve(results)
      })
    })
  }

  try {
    // 1. Buscamos todas las tablas de tu base de datos
    const tablasRaw = await query('SHOW TABLES')
    const nombresTablas = tablasRaw.map(row => Object.values(row)[0])

    const schema = {}

    // 2. Le pedimos a MySQL que nos describa exactamente las 3 tablas que acabamos de crear
    if (nombresTablas.includes('guides')) {
      schema.guides = await query('DESCRIBE guides')
    }
    if (nombresTablas.includes('destinations_config')) {
      schema.destinations_config = await query('DESCRIBE destinations_config')
    }
    if (nombresTablas.includes('bookings_pipeline')) {
      schema.bookings_pipeline = await query('DESCRIBE bookings_pipeline')
    }

    // 3. Imprimimos el resultado en pantalla
    return res.status(200).json({
      estado: '✅ Conexión perfecta',
      total_tablas: nombresTablas.length,
      listado_de_tablas: nombresTablas,
      estructura_de_nuevas_tablas: schema
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
