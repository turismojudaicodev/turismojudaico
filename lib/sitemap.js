import { query } from './mysql'

export async function getToursIds() {
  return query('SELECT codigo FROM paquetes')
}
