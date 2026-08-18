import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const NotificationContext = createContext(null)

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const timers = useRef({})

  const retirer = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const notifier = useCallback((texte, type = 'info') => {
    const id = ++idCounter
    setNotifications(prev => [...prev, { id, texte, type }])
    timers.current[id] = setTimeout(() => retirer(id), 5000)
  }, [retirer])

  return (
    <NotificationContext.Provider value={{ notifications, notifier, retirer }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used inside <NotificationProvider>')
  return ctx
}
