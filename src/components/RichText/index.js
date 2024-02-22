import 'quill/dist/quill.snow.css'
import { useEffect } from 'react'

export default function RichText({
  quill,
  quillRef,
  initialContent = undefined,
}) {
  useEffect(() => {
    if (initialContent) quill.root.innerHTML = initialContent
  }, [initialContent])

  return (
    <div style={{ maxWidth: '500px', marginBottom: '6rem' }}>
      <div ref={quillRef}></div>
      {/* <button type="button" onClick={() => console.log(quill.root.innerHTML)}>
        Ver texto
      </button> */}
    </div>
  )
}
