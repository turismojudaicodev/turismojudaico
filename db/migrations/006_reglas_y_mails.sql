-- 006: reglas de cobro del 27/11/2026 y mails automáticos.
-- Se puede correr más de una vez (IF NOT EXISTS).

-- Recargo del 5% al pagar con tarjeta. Se guarda aparte: amount_usd es lo que se descuenta del saldo.
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS surcharge_usd DECIMAL(10,2) NULL AFTER fee_usd;

-- Idioma en que se escriben los mails al cliente: el del sitio desde el que reservó ('es' o 'en').
ALTER TABLE bookings_pipeline ADD COLUMN IF NOT EXISTS client_language CHAR(2) NOT NULL DEFAULT 'en';

-- Respuestas a las preguntas nuevas del formulario de reserva (crucero, kosher, valijas, cliente que repite, etc.).
-- Es JSON para poder sumar preguntas sin otra migración.
ALTER TABLE bookings_pipeline ADD COLUMN IF NOT EXISTS booking_answers_json LONGTEXT NULL CHECK (booking_answers_json IS NULL OR JSON_VALID(booking_answers_json));
