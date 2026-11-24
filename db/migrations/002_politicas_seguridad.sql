-- Motor de políticas de seguridad. APLICADA en la base real el 24/11/2026.
-- Link real del formulario de la comunidad de Panamá (antes había un placeholder del setup).
UPDATE destinations_config
   SET external_form_url = 'https://visitors.centraldsi.com/'
 WHERE destination_name = 'Tour Judaico en Panama';

-- Para cambiar la política de un destino (GUIDE_VETTED | EXTERNAL_FORM | NONE):
-- UPDATE destinations_config SET security_policy_type = 'NONE' WHERE destination_name = 'Tour Judaico en ...';
-- Solo afecta a las reservas NUEVAS (cada reserva guarda la política con la que entró).
