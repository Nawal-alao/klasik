import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CLASSES_LABEL = {
  '6EME': 'Sixième', '5EME': 'Cinquième', '4EME': 'Quatrième',
  '3EME': 'Troisième', '2ND': 'Seconde', '1ERE': 'Première', 'TLE': 'Terminale',
}

export default function CoursList() {
  const { user } = useAuth()
  const [cours, setCours] = useState([])

  useEffect(() => {
    api.get('pedagogie/cours/').then(r => setCours(r.data))
  }, [])

  const isEleve = user?.classe_scolaire !== undefined
  const classeLabel = isEleve ? CLASSES_LABEL[user.classe_scolaire] : null

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Pédagogie</p>
        <h1>{isEleve ? 'Tes cours' : 'Tous les cours'}</h1>
        <p className="texte-doux">
          {isEleve
            ? `Filtrés automatiquement pour ${classeLabel}${user.serie !== 'AUCUNE' ? `, série ${user.serie}` : ''}.`
            : "Accès libre à l'ensemble des cours validés, toutes classes confondues."}
        </p>
      </div>

      {cours.length > 0 ? (
        <div className="grille-cartes">
          {cours.map(c => (
            <Link key={c.id} to={`/cours/${c.id}`} className="carte-cours">
              <span className="matiere-tag">{c.matiere?.nom}</span>
              <h3>{c.titre}</h3>
              <p>{c.description?.split(' ').slice(0, 20).join(' ')}{c.description?.split(' ').length > 20 ? '…' : ''}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Aucun cours n'est encore disponible pour ta classe et ta série. Reviens bientôt !</p>
          </div>
        </div>
      )}
    </main>
  )
}
