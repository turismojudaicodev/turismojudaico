// Components
import Link from 'next/link'
// Styles
import styles from './CardsContainer.module.css'
import utils from '@/styles/utils.module.css'
import Image from 'next/image'

export default function CardsContainer({ linkText, cardsName, cards }) {
  return (
    <div className={styles.cardsContainer}>
      {cards.map((card) => (
        <div key={card.id} className={styles.card}>
          <Link
            href={`/${cardsName}/${card.id}`}
            className={styles.imgContainer}
          >
            <Image
              src={card.image || '/images/logo.png'}
              alt="Imagen blog"
              fill
            />
          </Link>
          <div className={styles.info}>
            <Link href={`/${cardsName}/${card.id}`} className={styles.link}>
              <h3>{card.title}</h3>
            </Link>
            <p>{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
