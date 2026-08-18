import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function DashboardMentor() {
  const { user } = useAuth()
  const [suivis, setSuivis] = useState([])

  useEffect(() => {
    api.get('comptes/suivis-mentor/').then(r => setSuivis(r.data))
  }, [])

  if (!user) return null
  const matieres = user.matieres_detail?.map(m => m.nom).join(' · ') || ''
  const elevesUniques = [...new Map(suivis.map(s => [s.eleve, s])).values()]
  const actifs = suivis.filter(s => s.actif)

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Tableau de bord mentor</p>
        <h1>Salut {user.prenom} 👋</h1>
        <p className="texte-doux">{matieres}</p>
      </div>

      <div className="grille-stats">
        <div className="stat-carte">
          <div className="valeur">{elevesUniques.length}</div>
          <div className="label">Élève{elevesUniques.length > 1 ? 's' : ''} suivi{elevesUniques.length > 1 ? 's' : ''}</div>
        </div>
        <div className="stat-carte">
          <div className="valeur">{actifs.length}</div>
          <div className="label">Suivi{actifs.length > 1 ? 's' : ''} actif{actifs.length > 1 ? 's' : ''}</div>
        </div>
        <div className="stat-carte">
          <div className="valeur">{user.note_moyenne != null ? `${Number(user.note_moyenne).toFixed(1)}/5` : '—'}</div>
          <div className="label">Note moyenne</div>
        </div>
      </div>

      <div className="section-titre"><h2>Mes élèves</h2></div>
      <div className="carte">
        {suivis.length > 0 ? (
          <ul className="liste-simple">
            {suivis.map(s => (
              <li key={s.id}>
                <div>
                  <strong>{s.eleve_name}</strong>
                  <span className="texte-doux"> — {s.matiere_nom}</span>
                </div>
                <span className={`badge ${s.actif ? 'badge-actif' : 'badge-inactif'}`}>
                  {s.actif ? 'Actif' : 'Terminé'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="etat-vide">
            <p>Aucun élève ne te suit encore. Ton profil deviendra visible une fois les élèves inscrits sur la plateforme.</p>
          </div>
        )}
      </div>
    </main>
  )
}
