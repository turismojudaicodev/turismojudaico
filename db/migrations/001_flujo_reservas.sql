-- Migración de la base REAL para la branch pruebas-lucas.
-- APLICADA el 24/11/2026 (punto 1). El punto 2 (opcional) todavía no.
-- (El ENUM de bookings_pipeline.status ya se corrigió el 23/11/2026:
--  agrega SECURITY_DOCS_RECEIVED y SECURITY_REJECTED.)

-- 1. Extras del formulario de seguridad que hoy no tienen columna
--    (submit.js ahora los guarda; sin estas columnas el INSERT falla).
ALTER TABLE booking_security_details
  ADD COLUMN extra_port BOOLEAN DEFAULT FALSE,
  ADD COLUMN extra_casapueblo BOOLEAN DEFAULT FALSE,
  ADD COLUMN extra_callao BOOLEAN DEFAULT FALSE,
  ADD COLUMN extra_kosher_food BOOLEAN DEFAULT FALSE;

-- 2. Opcional (recomendado): una fila por reserva y mismo charset que el resto del pipeline.
--    Antes verificar que no haya duplicados:
--    SELECT booking_uuid, COUNT(*) FROM booking_security_details GROUP BY booking_uuid HAVING COUNT(*) > 1;
-- ALTER TABLE booking_security_details CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- ALTER TABLE booking_security_details ADD UNIQUE KEY booking_uuid (booking_uuid);
