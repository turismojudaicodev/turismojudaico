import { db } from '../../../../lib/mysql'

export default async function handler(req, res) {
  // 1. Convertir la conexión basada en callbacks de mysql2 a Promesas
  // Esto nos permite usar async/await para ejecutar las tablas en orden.
  const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) reject(err)
        else resolve(results)
      })
    })
  }

  try {
    console.log('🚀 Iniciando creación de tablas...')

    // 2. Crear Tabla de Guías
    await query(`
      CREATE TABLE IF NOT EXISTS guides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        default_cost_usd DECIMAL(10, 2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ Tabla guides creada.')

    // 3. Crear Tabla de Configuración de Destinos (Los 3 Casos de Seguridad)
    await query(`
      CREATE TABLE IF NOT EXISTS destinations_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        destination_name VARCHAR(100) NOT NULL UNIQUE,
        security_policy_type ENUM('NONE', 'EXTERNAL_FORM', 'GUIDE_VETTED') NOT NULL DEFAULT 'GUIDE_VETTED',
        external_form_url VARCHAR(255) NULL,
        default_guide_id INT NULL,
        contact_security_email VARCHAR(150) NULL,
        min_days_advance INT DEFAULT 3,
        FOREIGN KEY (default_guide_id) REFERENCES guides(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ Tabla destinations_config creada.')

    // 4. Crear Tabla del Pipeline Operativo y Financiero (Bookings)
    // Nota: Usamos GENERATED ALWAYS AS en MySQL para que el saldo y la ganancia se calculen solos.
    await query(`
      CREATE TABLE IF NOT EXISTS bookings_pipeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_uuid VARCHAR(36) NOT NULL UNIQUE,
        
        -- Datos del Cliente (Recibidos del Formulario)
        client_name VARCHAR(150) NOT NULL,
        client_email VARCHAR(150) NOT NULL,
        client_phone VARCHAR(50),
        hometown VARCHAR(150),
        pax_adults INT DEFAULT 1,
        pax_children INT DEFAULT 0,
        walking_difficulties TEXT NULL,
        
        -- Datos del Tour
        destination_name VARCHAR(100) NOT NULL,
        tour_date DATE NOT NULL,
        tour_option VARCHAR(50) DEFAULT 'Half Day',
        start_time VARCHAR(20) DEFAULT '09:00 AM',
        pick_up_hotel VARCHAR(200),
        drop_off_hotel VARCHAR(200),
        guide_id INT NULL,
        
        -- Máquina de Estados (El panel del Empleado)
        status ENUM(
          'INQUIRY_RECEIVED',
          'PENDING_SECURITY_VETTING',
          'SECURITY_DOCS_RECEIVED',
          'SECURITY_APPROVED',
          'SECURITY_REJECTED',
          'PENDING_DEPOSIT',
          'CONFIRMED_ASSIGNED',
          'COMPLETED',
          'CANCELLED'
        ) DEFAULT 'INQUIRY_RECEIVED',
        
        -- Control de Seguridad
        security_policy_applied ENUM('NONE', 'EXTERNAL_FORM', 'GUIDE_VETTED') NOT NULL,
        passport_files_json JSON NULL,
        security_token VARCHAR(100) NULL,
        
        -- Matemáticas y Finanzas Autocalculadas
        total_price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        deposit_paid_usd DECIMAL(10, 2) DEFAULT 0.00,
        payment_method VARCHAR(50) NULL,
        cash_to_guide_usd DECIMAL(10, 2) GENERATED ALWAYS AS (total_price_usd - deposit_paid_usd) STORED,
        guide_cost_usd DECIMAL(10, 2) DEFAULT 0.00,
        net_profit_usd DECIMAL(10, 2) GENERATED ALWAYS AS (deposit_paid_usd + (total_price_usd - deposit_paid_usd) - guide_cost_usd) STORED,
        
        -- Fechas de registro
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        -- Gmail (hoy guarda el message id, ver ToDo)
        gmail_draft_id VARCHAR(255) NULL,

        FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE SET NULL,
        FOREIGN KEY (destination_name) REFERENCES destinations_config(destination_name) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ Tabla bookings_pipeline creada.')

    // 5. Datos del formulario de seguridad (/security/[uuid] → api/security/submit.js)
    // Copia de la tabla real. Diferencias a propósito: utf8mb4 (la real es utf8mb3)
    // y UNIQUE(booking_uuid) para evitar filas duplicadas al reenviar el formulario.
    await query(`
      CREATE TABLE IF NOT EXISTS booking_security_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_uuid VARCHAR(255) NOT NULL UNIQUE,
        passengers_names TEXT NULL,
        passengers_ages TEXT NULL,
        passengers_passports TEXT NULL,
        travel_type VARCHAR(100) NULL,
        arrival_date DATE NULL,
        departure_date DATE NULL,
        hotel_name VARCHAR(255) NULL,
        phone_number VARCHAR(100) NULL,
        profession VARCHAR(255) NULL,
        home_address VARCHAR(255) NULL,
        community_name VARCHAR(255) NULL,
        religious_denomination VARCHAR(100) NULL,
        rabbi_name VARCHAR(255) NULL,
        visit_reason TEXT NULL,
        knows_someone BOOLEAN DEFAULT FALSE,
        other_institutions TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tour_type VARCHAR(100) NULL,
        start_time VARCHAR(50) NULL,
        dropoff_location VARCHAR(200) NULL,
        difficulty_walking BOOLEAN DEFAULT FALSE,
        extra_amia BOOLEAN DEFAULT FALSE,
        extra_airport BOOLEAN DEFAULT FALSE,
        extra_port BOOLEAN DEFAULT FALSE,
        extra_casapueblo BOOLEAN DEFAULT FALSE,
        extra_callao BOOLEAN DEFAULT FALSE,
        extra_kosher_food BOOLEAN DEFAULT FALSE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ Tabla booking_security_details creada.')

    // 6. Semillas: los mismos destinos que hay en la base real (nombres = los que usa el sitio)
    await query(`
      INSERT IGNORE INTO destinations_config (destination_name, security_policy_type, external_form_url)
      VALUES
        ('Tour Judaico en Panama', 'EXTERNAL_FORM', 'https://visitors.centraldsi.com/'),
        ('Tour Judaico en Recife', 'GUIDE_VETTED', NULL),
        ('Tour Judaico en Lima', 'GUIDE_VETTED', NULL),
        ('Tour Judaico Rio de Janeiro', 'GUIDE_VETTED', NULL),
        ('Tour Judaico en Santiago', 'GUIDE_VETTED', NULL),
        ('Tour Judaico Puerto Rico', 'GUIDE_VETTED', NULL),
        ('Tour Judaico en Curazao', 'GUIDE_VETTED', NULL),
        ('Tour Judaico en Buenos Aires', 'GUIDE_VETTED', NULL);
    `)

    return res.status(200).json({
      success: true,
      message: 'Tablas maestras creadas correctamente en MySQL.'
    })

  } catch (error) {
    console.error('❌ Error ejecutando setup:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}