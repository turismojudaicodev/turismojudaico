import Image from 'next/image'

export default function StrapiImage({ image }) {
  console.log('StrapiImage', image)

  if (!image) return <Image src="/images/logo.png" fill alt="Default image" />

  // return <Image />
}
