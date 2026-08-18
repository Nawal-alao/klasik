import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const DIFF_ORDER = ['FACILE', 'MOYEN', 'DIFFICILE']
const DIFF_LABEL = { FACILE: 'Facile', MOYEN: 'Moyen', DIFFICILE: 'Difficile' }

export default function ExamensList() {
  const [examens, setExamens] = useState([])

  useEffect(() => {
    api.get('evaluations/examens/').then(r => setExamens(r.data))
  }, [])

  const grouped = {}
  examens.forEach(e => {
    const key = e.niveau_difficulte
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Évaluation</p>
        <h1>Tes examens</h1>
        <p className="texte-doux">Un examen par cours, pour mesurer ta progression matière par matière.</p>
      </div>

      {examens.length > 0 ? (
        DIFF_ORDER.filter(k => grouped[k]).map(k => (
          <div key={k}>
            <div className="section-titre" style={{ marginTop: 28 }}>
              <h2>{DIFF_LABEL[k]}</h2>
            </div>
            {grouped[k].map(e => (
              <div key={e.id} className="carte-examen">
                <div>
                  <span className="matiere-tag">{e.matiere?.nom}</span>
                  <h3>{e.titre}</h3>
                  <p className="date-examen">
                    Publié le {new Date(e.date_publication).toLocaleDateString('fr-FR')} · {e.cours?.titre}
                  </p>
                </div>
                <Link to={`/examens/${e.id}/passer`} className="btn btn-primaire">Commencer</Link>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Aucun examen disponible pour l'instant. Reviens à la fin du mois !</p>
          </div>
        </div>
      )}
    </main>
  )
}
