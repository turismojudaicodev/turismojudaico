import { createContext, useContext, useState } from 'react'

const Context = createContext()

function Provider({ children }) {
  const [user, setUser] = useState(null)

  const exposed = { user, setUser }

  return <Context.Provider value={exposed}>{children}</Context.Provider>
}

export function useUser() {
  return useContext(Context)
}

export default Provider
