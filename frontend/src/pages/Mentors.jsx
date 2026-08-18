import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Mentors() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState([])
  const [matieres, setMatieres] = useState([])
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const [suivreMessage, setSuivreMessage] = useState('')

  useEffect(() => {
    api.get('pedagogie/matieres/').then(r => setMatieres(r.data))
    loadMentors('')
  }, [])

  const loadMentors = (matiereId) => {
    const url = matiereId ? `comptes/mentors/?matiere=${matiereId}` : 'comptes/mentors/'
    api.get(url).then(r => setMentors(r.data))
  }

  const handleFilter = (e) => {
    const val = e.target.value
    setSelectedMatiere(val)
    loadMentors(val)
  }

  const handleSuivre = (mentorId, matiereId) => {
    setSuivreMessage('')
    api.post(`comptes/mentors/${mentorId}/suivre/`, { matiere: matiereId })
      .then(() => setSuivreMessage('Mentor ajouté !'))
      .catch(err => setSuivreMessage(err.response?.data?.detail || 'Erreur'))
  }

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Mentorat</p>
        <h1>Trouver un mentor</h1>
        <p className="texte-doux">Choisis un mentor selon la matière où tu as besoin d'aide.</p>
      </div>

      <div className="barre-filtre">
        <select value={selectedMatiere} onChange={handleFilter}>
          <option value="">Toutes les matières</option>
          {matieres.map(m => (
            <option key={m.id} value={m.id}>{m.nom}</option>
          ))}
        </select>
        {selectedMatiere && (
          <a href="#" className="reinitialiser" onClick={e => { e.preventDefault(); setSelectedMatiere(''); loadMentors('') }}>
            Réinitialiser
          </a>
        )}
      </div>

      {suivreMessage && (
        <div className="carte" style={{ marginBottom: 16, padding: '12px 18px' }}>
          <p style={{ margin: 0 }}>{suivreMessage}</p>
        </div>
      )}

      {mentors.length > 0 ? (
        <div className="grille-cartes">
          {mentors.map(m => (
            <div key={m.id} className="carte-mentor">
              <div className="entete-mentor">
                <h3>{m.prenom} {m.nom}</h3>
                {m.note_moyenne != null && (
                  <span className="note">★ {Number(m.note_moyenne).toFixed(1)}/5</span>
                )}
              </div>
              {m.bio && <p className="bio">{m.bio.split(' ').slice(0, 24).join(' ')}{m.bio.split(' ').length > 24 ? '…' : ''}</p>}
              <div className="tags-matieres">
                {m.matieres_detail?.map(mt => (
                  <span key={mt.id} className="matiere-tag">{mt.nom}</span>
                ))}
              </div>
              <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleSuivre(m.id, fd.get('matiere')) }}>
                <select name="matiere" required>
                  {m.matieres_detail?.map(mt => (
                    <option key={mt.id} value={mt.id}>{mt.nom}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primaire">Suivre</button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Aucun mentor disponible pour cette matière pour le moment.</p>
          </div>
        </div>
      )}
    </main>
  )
}
