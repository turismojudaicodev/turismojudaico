export async function handleNewsletterSignup(data) {
  if (!data.name || !data.email)
    return res.status(400).json({ error: 'Falta el nombre o el email' })

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

export async function getFilteredContent(url, filters = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  })
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
