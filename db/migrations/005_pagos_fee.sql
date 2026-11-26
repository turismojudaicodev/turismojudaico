-- 005: comisión de Stripe por pago (para la planilla "Pagos online").
-- Necesaria si la 004 se corrió antes de que tuviera fee_usd. Si ya existe, no hace nada.
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS fee_usd DECIMAL(10,2) NULL AFTER amount_usd;
