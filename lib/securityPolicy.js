// Motor de políticas de seguridad por destino (destinations_config.security_policy_type).
//
//  GUIDE_VETTED  -> el cliente completa el form con pasaporte; el guía aprueba/rechaza por mail (links con token).
//  EXTERNAL_FORM -> el cliente completa el form de la comunidad (external_form_url) + nuestro form de viaje;
//                   el empleado marca "aprobado/rechazado por la comunidad" desde el panel.
//  NONE          -> sin control: con nuestro form de viaje la reserva queda lista para cobrar.
//
// La política se decide al recibir la consulta y queda guardada en bookings_pipeline.security_policy_applied.

export const POLICIES = {
  GUIDE_VETTED: 'GUIDE_VETTED',
  EXTERNAL_FORM: 'EXTERNAL_FORM',
  NONE: 'NONE',
}

export const DEFAULT_POLICY = POLICIES.GUIDE_VETTED

export const normalizePolicy = (value) => (Object.values(POLICIES).includes(value) ? value : DEFAULT_POLICY)

// Estado al que pasa la reserva cuando el cliente envía nuestro formulario de viaje
export const statusAfterTripForm = (policy) =>
  normalizePolicy(policy) === POLICIES.NONE ? 'SECURITY_APPROVED' : 'SECURITY_DOCS_RECEIVED'

// Política con la que se registra un destino nuevo (después se puede cambiar en la base)
export const policyForNewDestination = (destinationName) =>
  /panam[aá]/i.test(String(destinationName || '')) ? POLICIES.EXTERNAL_FORM : DEFAULT_POLICY

// query: (sql, params) => Promise<rows>
export async function getDestinationPolicy(query, destinationName) {
  const rows = await query(
    'SELECT security_policy_type, external_form_url FROM destinations_config WHERE destination_name = ?',
    [destinationName]
  )
  const row = rows[0] || {}
  return {
    policy: normalizePolicy(row.security_policy_type),
    externalFormUrl: row.external_form_url || null,
  }
}
