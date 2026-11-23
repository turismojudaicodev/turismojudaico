import { query } from '../../../../lib/mysql'

const BOOKING_STATUSES = `ENUM(
  'INQUIRY_RECEIVED',
  'PENDING_SECURITY_VETTING',
  'SECURITY_DOCS_RECEIVED',
  'SECURITY_APPROVED',
  'SECURITY_REJECTED',
  'PENDING_DEPOSIT',
  'CONFIRMED_ASSIGNED',
  'COMPLETED',
  'CANCELLED'
)`

/** Agrega una columna solo si no existe (MySQL no soporta ADD COLUMN IF NOT EXISTS). */
async function addColumnIfMissing(table, column, definition) {
  const rows = await query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  )
  if (rows.length === 0) {
    await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

export default async function handler(req, res) {
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
        tour_option VARCHAR(100) DEFAULT 'Half Day',
        start_time VARCHAR(20) DEFAULT '09:00 AM',
        pick_up_hotel VARCHAR(200),
        drop_off_hotel VARCHAR(200),
        guide_id INT NULL,
        
        -- Máquina de Estados (El panel del Empleado)
        status ${BOOKING_STATUSES} DEFAULT 'INQUIRY_RECEIVED',
        
        -- Control de Seguridad
        security_policy_applied ENUM('NONE', 'EXTERNAL_FORM', 'GUIDE_VETTED') NOT NULL,
        passport_files_json JSON NULL,
        security_token VARCHAR(100) NULL,
        gmail_draft_id VARCHAR(100) NULL,
        
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
        
        FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE SET NULL,
        FOREIGN KEY (destination_name) REFERENCES destinations_config(destination_name) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ Tabla bookings_pipeline creada.')

    // 5. Datos del formulario de seguridad que completa el cliente (una fila por reserva)
    await query(`
      CREATE TABLE IF NOT EXISTS booking_security_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_uuid VARCHAR(36) NOT NULL,
        passengers_names TEXT,
        passengers_ages TEXT,
        passengers_passports TEXT,
        travel_type VARCHAR(50),
        arrival_date DATE NULL,
        departure_date DATE NULL,
        hotel_name VARCHAR(200),
        phone_number VARCHAR(50),
        profession VARCHAR(100),
        home_address VARCHAR(200),
        community_name VARCHAR(200),
        religious_denomination VARCHAR(50),
        rabbi_name VARCHAR(150),
        visit_reason VARCHAR(200),
        knows_someone BOOLEAN DEFAULT FALSE,
        other_institutions TEXT,
        tour_type VARCHAR(100),
        start_time VARCHAR(20),
        dropoff_location VARCHAR(200),
        difficulty_walking BOOLEAN DEFAULT FALSE,
        extra_amia BOOLEAN DEFAULT FALSE,
        extra_airport BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (booking_uuid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ Tabla booking_security_details creada.')

    // 6. Migraciones para bases creadas con versiones anteriores de este script
    await query(`ALTER TABLE bookings_pipeline MODIFY status ${BOOKING_STATUSES} DEFAULT 'INQUIRY_RECEIVED'`)
    await query(`ALTER TABLE bookings_pipeline MODIFY tour_option VARCHAR(100) DEFAULT 'Half Day'`)
    await addColumnIfMissing('bookings_pipeline', 'gmail_draft_id', 'VARCHAR(100) NULL')
    for (const extra of ['extra_port', 'extra_casapueblo', 'extra_callao', 'extra_kosher_food']) {
      await addColumnIfMissing('booking_security_details', extra, 'BOOLEAN DEFAULT FALSE')
    }
    console.log('✅ Migraciones aplicadas.')

    // 7. Configuración semilla (los nombres tienen que coincidir con los del sitio)
    await query(`
      INSERT IGNORE INTO destinations_config (destination_name, security_policy_type, external_form_url)
      VALUES 
        ('Panama', 'EXTERNAL_FORM', 'https://comunidadpanama.org/formulario-seguridad'),
        ('Santiago de Chile', 'GUIDE_VETTED', NULL),
        ('Curacao', 'NONE', NULL);
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