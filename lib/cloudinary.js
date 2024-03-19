export async function uploadImage(image) {
  if (image.size > 0) {
    const fd = new FormData()
    fd.append('file', image)
    fd.append('upload_preset', 'turismojudaico')
    const data = await fetch(
      'https://api.cloudinary.com/v1_1/ds1tdcumj/image/upload',
      {
        method: 'POST',
        body: fd,
      }
    ).then((r) => r.json())
    return data.secure_url
  }
  return null
}

export async function uploadJSON(jsonFile) {
  const blob = new Blob([jsonFile], { type: 'application/json' })

  const fd = new FormData()
  fd.append('file', blob)
  fd.append('upload_preset', 'rawfiles')

  try {
    const data = await fetch(
      'https://api.cloudinary.com/v1_1/ds1tdcumj/raw/upload', // Use raw upload endpoint for JSON files
      {
        method: 'POST',
        body: fd,
      }
    ).then((r) => r.json())
    console.log({ data })
    return data.secure_url
  } catch (error) {
    console.error('Error uploading JSON file:', error)
    return null
  }
}
