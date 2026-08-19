import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/axios'

export default function Communaute() {
  const { user, userType } = useAuth()
  const { notifier } = useNotification()
  const [groupes, setGroupes] = useState([])
  const [matieres, setMatieres] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [matiereId, setMatiereId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadGroupes = () => {
    api.get('communaute/groupes/').then(r => setGroupes(r.data))
  }

  useEffect(() => {
    loadGroupes()
  }, [])

  const isEleve = userType === 'eleve'

  const openForm = () => {
    if (!showForm && matieres.length === 0) {
      api.get('pedagogie/matieres/').then(r => setMatieres(r.data))
    }
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nom.trim() || !matiereId) return
    setSubmitting(true)
    api.post('communaute/groupes/proposer/', {
      nom: nom.trim(),
      matiere: Number(matiereId),
    }).then(() => {
      notifier('Ta proposition de groupe a été envoyée, elle sera visible une fois validée.', 'success')
      setNom('')
      setMatiereId('')
      setShowForm(false)
    }).catch(err => {
      const msg = err.response?.data?.detail || err.response?.data?.nom?.[0] || 'Erreur lors de la proposition.'
      notifier(msg, 'error')
    }).finally(() => setSubmitting(false))
  }

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Communauté</p>
        <h1>Groupes d'étude</h1>
        <p className="texte-doux">Échange avec des élèves de ta classe et ta série, matière par matière.</p>
      </div>

      {isEleve && (
        <div style={{ marginBottom: 24 }}>
          {showForm ? (
            <form onSubmit={handleSubmit} className="carte" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Proposer un groupe</h3>
              <input
                type="text"
                placeholder="Nom du groupe"
                required
                maxLength={150}
                value={nom}
                onChange={e => setNom(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #d1ccc4', borderRadius: 8, fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' }}
              />
              <select
                required
                value={matiereId}
                onChange={e => setMatiereId(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #d1ccc4', borderRadius: 8, fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="">Choisir une matière…</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primaire" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Envoi…' : 'Proposer'}
                </button>
                <button type="button" className="btn btn-secondaire" style={{ flex: 1 }} onClick={() => { setShowForm(false); setNom(''); setMatiereId('') }}>
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <button onClick={openForm} className="btn btn-primaire" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Créer un groupe
            </button>
          )}
        </div>
      )}

      {groupes.length > 0 ? (
        <div className="grille-cartes">
          {groupes.map(g => (
            <Link key={g.id} to={`/communaute/${g.id}`} className="carte-groupe">
              <span className="matiere-tag">{g.matiere?.nom || g.matiere}</span>
              <h3>{g.nom}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Aucun groupe d'étude n'est encore disponible pour ta classe et ta série.</p>
          </div>
        </div>
      )}
    </main>
  )
}
