import Link from "next/link"

/*
quienes somos
blogs
audioguías
city tours
newsletter
*/
export default function Header() {
  const LINKS = [
    {
      title: 'quienes somos',
      url: '/about'
    },
    {
      title: 'blogs',
      url: 'blogs'
    },
    {
      title: 'audiogías',
      url: 'audioguides'
    },
    {
      title: 'city tours',
      url: 'citytours'
    },
    {
      title: 'newsletter',
      url: 'newsletter'
    }
  ]

  return (
    <header>
      <nav>
        <ul>
          {LINKS.map(link =>
            <li key={link.url}>
              <Link href={link.url}>{link.title}</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}