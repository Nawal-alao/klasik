import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Communaute() {
  const [groupes, setGroupes] = useState([])

  useEffect(() => {
    api.get('communaute/groupes/').then(r => setGroupes(r.data))
  }, [])

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Communauté</p>
        <h1>Groupes d'étude</h1>
        <p className="texte-doux">Échange avec des élèves de ta classe et ta série, matière par matière.</p>
      </div>

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
