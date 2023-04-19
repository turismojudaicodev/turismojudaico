// Components
import AdminLayout from '@/components/AdminLayout'
// Styles
import utils from '@/styles/utils.module.css'

export default function Dashboard() {
  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Turismo Judaico</h1>
      <p>Bienvenido al panel de administrador de Turismo Judaico.</p>
      <p>
        Seleccione una de las secciones disponibles en el menú de navegación de
        la izquierda.
      </p>
    </AdminLayout>
  )
}
