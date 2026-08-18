import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getAccessToken, setTokens, clearTokens } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // profil (eleve ou mentor)
  const [userType, setUserType] = useState(null) // 'eleve' | 'mentor'
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchProfil = useCallback(async () => {
    try {
      const { data } = await api.get('comptes/mon-profil/')
      setUser(data)
      setUserType(data.classe_scolaire !== undefined ? 'eleve' : 'mentor')
      return data
    } catch {
      setUser(null)
      setUserType(null)
      clearTokens()
      return null
    }
  }, [])

  // On mount: if a token exists, try to fetch the profile
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetchProfil().finally(() => setLoading(false))
  }, [fetchProfil])

  const login = async (username, password) => {
    const { data } = await api.post('auth/token/', { username, password })
    setTokens(data.access, data.refresh)

    const profil = await fetchProfil()
    if (profil) {
      const isEleve = profil.classe_scolaire !== undefined
      navigate(isEleve ? '/dashboard/eleve' : '/dashboard/mentor')
    }
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    setUserType(null)
    navigate('/connexion')
  }

  const inscriptionEleve = async (payload) => {
    await api.post('comptes/inscription/eleve/', payload)
    // Inscription succeeded → redirect to login (same as Django's success_url)
    navigate('/connexion')
  }

  const inscriptionMentor = async (payload) => {
    await api.post('comptes/inscription/mentor/', payload)
    navigate('/connexion')
  }

  return (
    <AuthContext.Provider
      value={{ user, userType, loading, login, logout, inscriptionEleve, inscriptionMentor }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
