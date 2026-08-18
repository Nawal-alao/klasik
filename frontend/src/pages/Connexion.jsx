import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Connexion() {
  const { login, user } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [sending, setSending] = useState(false)

  if (user) {
    const isEleve = user.classe_scolaire !== undefined
    return <Navigate to={isEleve ? '/dashboard/eleve' : '/dashboard/mentor'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setSending(true)
    try {
      await login(username, password)
    } catch (err) {
      const data = err.response?.data
      if (data?.detail) {
        setErreur(data.detail)
      } else if (data?.non_field_errors) {
        setErreur(Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors)
      } else {
        setErreur("Identifiants incorrects. Réessaie.")
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <main>
      <div className="conteneur-auth">
        <p className="eyebrow">Bienvenue</p>
        <h1>Se connecter</h1>
        <p className="sous-titre">Retrouve tes cours, tes mentors et ta progression.</p>

        <div className="carte-auth">
          <form onSubmit={handleSubmit} noValidate>
            {erreur && <p className="champ-erreur">{erreur}</p>}

            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="btn btn-primaire" disabled={sending}>
              {sending ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="lien-bas-de-carte">
            Pas encore de compte ?
            {' '}<Link to="/inscription/eleve">Inscription élève</Link>
            {' · '}
            <Link to="/inscription/mentor">Inscription mentor</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
