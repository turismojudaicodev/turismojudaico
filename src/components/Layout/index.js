import Header from '../Header'
import Footer from '../Footer'

export default function Layout(props) {
  return (
    <>
      <Header />
      <div style={{ minHeight: '50vh' }}>{props.children}</div>
      <Footer />
    </>
  )
}
