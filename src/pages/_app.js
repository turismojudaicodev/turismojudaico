import '@/styles/globals.css'
import { Open_Sans } from '@next/font/google'
import { appWithTranslation } from 'next-i18next'

const openSans = Open_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
})

function App({ Component, pageProps }) {
  return (
    <div className={openSans.className}>
      <Component {...pageProps} />
    </div>
  )
}

export default appWithTranslation(App)
