import '@/styles/globals.css'
import { Open_Sans } from '@next/font/google'

const openSans = Open_Sans({
  weight: ['400', '600'],
  subsets: ['latin']
})

export default function App({ Component, pageProps }) {
  return (
    <div className={openSans.className}>
      <Component {...pageProps} />
    </div>
  )
}
