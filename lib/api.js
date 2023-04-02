export async function handleNewsletterSignup(data) {
  if (!data) throw new Error('Name and email for signup must be provided')

  if (!data.name || !data.email) throw new Error('Data is incomplete')

  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: {
      'Content-Type': 'applicaton/json',
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export async function getContent(url) {
  const res = await fetch(url)
  const data = await res.json()
  return data
}

export async function getUniqueContent(url, contentId) {
  const res = await fetch(`${url}/${contentId}`)
  const data = await res.json()
  return data
}

export async function postContent(url, content) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })
  const data = await res.json()
  return data
}

export async function updateUniqueContent(url, contentId, data) {
  const res = await fetch(`${url}/${contentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const updatedBlog = await res.json()
  return updatedBlog
}

export async function deleteContent(url, contentId) {
  const res = await fetch(`${url}/${contentId}`, {
    method: 'DELETE',
  })
  const data = await res.json()
  return data
}
