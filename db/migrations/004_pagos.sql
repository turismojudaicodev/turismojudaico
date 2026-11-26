-- 004: pagos (seña USD 50 + saldo) por Stripe, Zelle y efectivo.
-- Es aditiva: no borra ni cambia datos existentes.

-- 1. Un registro por cada pago (o intento de pago). Una reserva puede tener varios:
--    seña por Stripe + saldo en efectivo, dos transferencias Zelle, etc.
CREATE TABLE IF NOT EXISTS booking_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_uuid VARCHAR(36) NOT NULL,
  kind ENUM('DEPOSIT', 'BALANCE', 'FULL', 'OTHER') NOT NULL,
  method ENUM('STRIPE', 'ZELLE', 'CASH') NOT NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  fee_usd DECIMAL(10, 2) NULL,         -- comisión de la plataforma (Stripe); NULL si no aplica o todavía no se conoce
  -- PENDING: checkout de Stripe abierto · REPORTED: el cliente informó un Zelle, falta verificar
  -- CONFIRMED: plata recibida · FAILED: vencido/rechazado · REFUNDED: devuelto
  status ENUM('PENDING', 'REPORTED', 'CONFIRMED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  stripe_session_id VARCHAR(255) NULL UNIQUE,
  stripe_payment_intent VARCHAR(255) NULL,
  reference VARCHAR(255) NULL,        -- n° de confirmación de Zelle, etc.
  payer_name VARCHAR(150) NULL,       -- nombre con el que pagó (en Zelle suele ser distinto)
  notes TEXT NULL,
  confirmed_by VARCHAR(100) NULL,     -- 'stripe-webhook', usuario del panel, 'guide'
  confirmed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_booking (booking_uuid),
  INDEX idx_status (status),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_uuid) REFERENCES bookings_pipeline(booking_uuid) ON DELETE RESTRICT  -- no se borra una reserva con pagos
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Estado nuevo: seña recibida (entre "Esperando Pago" y "Confirmada").
ALTER TABLE bookings_pipeline MODIFY status ENUM(
  'INQUIRY_RECEIVED',
  'PENDING_SECURITY_VETTING',
  'SECURITY_DOCS_RECEIVED',
  'SECURITY_APPROVED',
  'SECURITY_REJECTED',
  'PENDING_DEPOSIT',
  'DEPOSIT_PAID',
  'CONFIRMED_ASSIGNED',
  'COMPLETED',
  'CANCELLED'
) DEFAULT 'INQUIRY_RECEIVED';

-- 3. Para no armar dos veces el recordatorio del saldo (14 días antes del tour).
ALTER TABLE bookings_pipeline ADD COLUMN IF NOT EXISTS balance_reminder_at DATETIME NULL;

-- Verificación:
-- SHOW CREATE TABLE booking_payments;
-- SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings_pipeline' AND COLUMN_NAME = 'status';
