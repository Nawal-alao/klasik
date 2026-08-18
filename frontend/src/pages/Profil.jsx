import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CLASSES = [
  { value: '6EME', label: 'Sixième' }, { value: '5EME', label: 'Cinquième' },
  { value: '4EME', label: 'Quatrième' }, { value: '3EME', label: 'Troisième' },
  { value: '2ND', label: 'Seconde' }, { value: '1ERE', label: 'Première' },
  { value: 'TLE', label: 'Terminale' },
]
const SERIES = [
  { value: 'AUCUNE', label: 'Aucune (collège)' }, { value: 'A', label: 'Série A' },
  { value: 'B', label: 'Série B' }, { value: 'C', label: 'Série C' },
  { value: 'D', label: 'Série D' },
]

export default function Profil() {
  const { user, userType } = useAuth()
  const [form, setForm] = useState({})
  const [erreurs, setErreurs] = useState({})
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) setForm({ prenom: user.prenom || '', nom: user.nom || '', ...(userType === 'eleve' ? { age: user.age || '', classe_scolaire: user.classe_scolaire || '6EME', serie: user.serie || 'AUCUNE' } : { bio: user.bio || '' }) })
  }, [user, userType])

  if (!user) return null

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErreurs(er => ({ ...er, [field]: undefined }))
    setSaved(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    setSaved(false)
    const payload = userType === 'eleve'
      ? { prenom: form.prenom, nom: form.nom, age: Number(form.age), classe_scolaire: form.classe_scolaire, serie: form.serie }
      : { prenom: form.prenom, nom: form.nom, bio: form.bio }
    api.patch('comptes/mon-profil/', payload).then(() => {
      setSaved(true)
      setErreurs({})
    }).catch(err => {
      const data = err.response?.data
      const fieldErrors = {}
      for (const [k, v] of Object.entries(data || {})) {
        fieldErrors[k] = Array.isArray(v) ? v.join(' ') : String(v)
      }
      setErreurs(fieldErrors)
    }).finally(() => setSending(false))
  }

  return (
    <main>
      <div className="conteneur-auth">
        <p className="eyebrow">Mon compte</p>
        <h1>Mon profil</h1>
        <p className="sous-titre">
          {userType === 'eleve'
            ? 'Mets à jour tes informations, notamment ta classe quand tu passes au niveau supérieur.'
            : 'Tiens ta bio et tes matières à jour pour attirer les bons élèves.'}
        </p>

        <div className="carte-auth">
          <form onSubmit={handleSubmit} noValidate>
            {saved && <p className="champ-erreur" style={{ color: 'var(--couleur-succes)' }}>Profil mis à jour !</p>}

            <label htmlFor="prenom">Prénom</label>
            <input id="prenom" type="text" required value={form.prenom || ''} onChange={set('prenom')} />
            {erreurs.prenom && <p className="champ-erreur">{erreurs.prenom}</p>}

            <label htmlFor="nom">Nom</label>
            <input id="nom" type="text" required value={form.nom || ''} onChange={set('nom')} />
            {erreurs.nom && <p className="champ-erreur">{erreurs.nom}</p>}

            {userType === 'eleve' ? (
              <>
                <label htmlFor="age">Âge</label>
                <input id="age" type="number" min="8" max="25" required value={form.age || ''} onChange={set('age')} />
                {erreurs.age && <p className="champ-erreur">{erreurs.age}</p>}

                <label htmlFor="classe_scolaire">Classe</label>
                <select id="classe_scolaire" value={form.classe_scolaire || '6EME'} onChange={set('classe_scolaire')}>
                  {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                <label htmlFor="serie">Série</label>
                <select id="serie" value={form.serie || 'AUCUNE'} onChange={set('serie')}>
                  {SERIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </>
            ) : (
              <>
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" rows="3" value={form.bio || ''} onChange={set('bio')} />
                {erreurs.bio && <p className="champ-erreur">{erreurs.bio}</p>}
              </>
            )}

            <button type="submit" className="btn btn-primaire" disabled={sending}>
              {sending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
