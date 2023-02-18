// Components
import Link from 'next/link'
import Image from 'next/image'
// Styles
import styles from './CardsContainer.module.css'
import utils from '@/styles/utils.module.css'
import StrapiImage from '../StrapiImage'

export default function CardsContainer({ linkText, cardsName, cards }) {
  return (
    <div className={styles.cardsContainer}>
      {cards.map((card) => (
        <div key={card.id} className={styles.card}>
          <Link
            href={`/${cardsName}/${card.id}`}
            className={styles.imgContainer}
          >
            <StrapiImage />
            {/* <Image
              src={
                card.attributes.img
                  ? `${card.attributes.img}`
                  : '/images/logo.png'
              }
              fill
              alt="img"
            /> */}
          </Link>
          <div className={styles.info}>
            <h3>{card.attributes.title}</h3>
            <p>{card.attributes.description}</p>
            <Link href={`/${cardsName}/${card.id}`} className={utils.button}>
              {linkText}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
