// NPM
import { useRouter } from 'next/router'
import { useEffect } from 'react'
// Local
import { useUser } from 'context/user'
// Components
import AdminLayout from '@/components/AdminLayout'
// Styles
import utils from '@/styles/utils.module.css'

export async function getServerSideProps({ req }) {
  console.log('headers', req.headers)
  console.log('cookies', req.cookies)

  return {
    props: {
      authorized: true,
    },
  }
}

export default function Dashboard({ authorized }) {
  console.log('authorized', authorized)
  const { user } = useUser()

  const router = useRouter()

  useEffect(() => {
    // if (!user) router.push('/admin')
    // check
  }, [router.route])

  return (
    <AdminLayout>
      <p>
        Bienvenido al panel de administrador de Turismo Judaico.
        <br /> Seleccione una de las secciones disponibles en el menú de
        navegación de la izquierda.
      </p>
    </AdminLayout>
  )
}
