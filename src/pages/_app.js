import '@/styles/globals.css'
import { Open_Sans } from '@next/font/google'
import { appWithTranslation } from 'next-i18next'
import UserProvider from 'context/user'

const openSans = Open_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
})

function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <div className={openSans.className}>
        <Component {...pageProps} />
      </div>
    </UserProvider>
  )
}

export default appWithTranslation(App)
