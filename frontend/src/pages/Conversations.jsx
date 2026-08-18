import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Conversations() {
  const [suivis, setSuivis] = useState([])

  useEffect(() => {
    api.get('communaute/conversations/').then(r => setSuivis(r.data))
  }, [])

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Messagerie</p>
        <h1>Mes conversations</h1>
        <p className="texte-doux">Échanges privés avec tes mentors, matière par matière.</p>
      </div>

      {suivis.length > 0 ? (
        <div className="carte">
          <ul className="liste-simple">
            {suivis.map(s => (
              <li key={s.id}>
                <Link to={`/conversations/${s.id}`} style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <strong>{s.mentor}</strong>
                    <span className="texte-doux"> — {s.matiere}</span>
                  </div>
                  <span className="badge badge-actif">Actif</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Aucune conversation pour le moment.</p>
          </div>
        </div>
      )}
    </main>
  )
}
