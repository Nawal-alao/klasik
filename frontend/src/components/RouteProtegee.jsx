import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RouteProtegee({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main>
        <div className="etat-vide">
          <p>Chargement…</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/connexion" replace />
  }

  return children
}
