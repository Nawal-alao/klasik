import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'

const NotificationContext = createContext(null)

const ICONES = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

const COULEURS = {
  success: 'var(--couleur-succes)',
  info: 'var(--couleur-info)',
  warning: 'var(--couleur-accent)',
  error: 'var(--couleur-erreur)',
}

const MAX_VISIBLE = 4
const AUTO_DISPARITION = 4000
const DUREE_SORTIE = 200

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const timers = useRef({})
  const fileAttente = useRef([])

  const retirer = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]

    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, sortant: true } : n
    ))

    setTimeout(() => {
      setNotifications(prev => {
        const next = prev.filter(n => n.id !== id)
        if (fileAttente.current.length > 0 && next.length < MAX_VISIBLE) {
          const suivante = fileAttente.current.shift()
          clearTimeout(timers.current[suivante.id])
          timers.current[suivante.id] = setTimeout(() => retirer(suivante.id), AUTO_DISPARITION)
          return [...next, suivante]
        }
        return next
      })
    }, DUREE_SORTIE)
  }, [])

  const notifier = useCallback((texte, type = 'info') => {
    const id = ++idCounter
    const notification = { id, texte, type, sortant: false }

    setNotifications(prev => {
      if (prev.length >= MAX_VISIBLE) {
        fileAttente.current.push(notification)
        return prev
      }
      timers.current[id] = setTimeout(() => retirer(id), AUTO_DISPARITION)
      return [...prev, notification]
    })
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

export function ConteneurNotifications({ notifications, onRetirer }) {
  const hasErrors = notifications.some(n => n.type === 'error')
  const hasOthers = notifications.some(n => n.type !== 'error')

  return (
    <div className="conteneur-notifications">
      {hasOthers && (
        <div className="sr-only" role="status" aria-live="polite">
          {notifications.filter(n => n.type !== 'error').map(n => n.texte).join('. ')}
        </div>
      )}
      {hasErrors && (
        <div className="sr-only" role="status" aria-live="assertive">
          {notifications.filter(n => n.type === 'error').map(n => n.texte).join('. ')}
        </div>
      )}
      <div className="notifications-pile">
        {notifications.map(n => {
          const Icone = ICONES[n.type] || Info
          const couleur = COULEURS[n.type] || COULEURS.info
          return (
            <div
              key={n.id}
              className={`notification notification-${n.type}${n.sortant ? ' notification-sortie' : ''}`}
              role={n.type === 'error' ? 'alert' : 'status'}
            >
              <div className="notification-icon" style={{ color: couleur }}>
                <Icone size={20} strokeWidth={2} />
              </div>
              <p className="notification-texte">{n.texte}</p>
              <button
                type="button"
                className="notification-fermer"
                onClick={() => onRetirer(n.id)}
                aria-label="Fermer la notification"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
