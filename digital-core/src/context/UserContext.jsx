import { createContext, useContext, useMemo, useState } from 'react'

const UserCtx = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('dc_user')
    return raw ? JSON.parse(raw) : null
  })

  const value = useMemo(() => ({
    user,
    login: (u) => { setUser(u); localStorage.setItem('dc_user', JSON.stringify(u)) },
    logout: () => { setUser(null); localStorage.removeItem('dc_user') }
  }), [user])

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>
}

export function useUser() {
  const ctx = useContext(UserCtx)
  if (!ctx) throw new Error('useUser måste användas inom UserProvider')
  return ctx
}
