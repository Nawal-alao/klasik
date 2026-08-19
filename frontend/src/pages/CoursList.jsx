import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, Bookmark } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Squelette from '../components/Squelette'
import ChargementFluide from '../components/ChargementFluide'

const CLASSES_LABEL = {
  '6EME': 'Sixième', '5EME': 'Cinquième', '4EME': 'Quatrième',
  '3EME': 'Troisième', '2ND': 'Seconde', '1ERE': 'Première', 'TLE': 'Terminale',
}

function SqueletteCarteCours() {
  return (
    <div className="carte-cours" style={{ pointerEvents: 'none' }}>
      <div className="carte-cours-header">
        <Squelette largeur={72} hauteur={22} arrondi="999px" />
      </div>
      <Squelette largeur="70%" hauteur={20} style={{ marginBottom: 12 }} />
      <Squelette largeur="100%" hauteur={14} style={{ marginBottom: 8 }} />
      <Squelette largeur="85%" hauteur={14} />
    </div>
  )
}

export default function CoursList() {
  const { user } = useAuth()
  const location = useLocation()
  const [cours, setCours] = useState([])
  const [loading, setLoading] = useState(true)

  const isFavorisView = location.pathname === '/cours/favoris'

  useEffect(() => {
    setLoading(true)
    const url = isFavorisView ? 'pedagogie/cours/favoris/' : 'pedagogie/cours/'
    api.get(url).then(r => setCours(r.data)).finally(() => setLoading(false))
  }, [isFavorisView])

  const isEleve = user?.classe_scolaire !== undefined
  const classeLabel = isEleve ? CLASSES_LABEL[user.classe_scolaire] : null

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">{isFavorisView ? 'Mes favoris' : 'Pédagogie'}</p>
        <h1>{isFavorisView ? 'Mes cours favoris' : (isEleve ? 'Tes cours' : 'Tous les cours')}</h1>
        <p className="texte-doux">
          {isFavorisView
            ? 'Les cours que tu as ajoutés en favoris pour y accéder rapidement.'
            : isEleve
              ? `Filtrés automatiquement pour ${classeLabel}${user.serie !== 'AUCUNE' ? `, série ${user.serie}` : ''}.`
              : "Accès libre à l'ensemble des cours validés, toutes classes confondues."}
        </p>
        {isFavorisView && (
          <Link to="/cours" className="btn btn-secondaire" style={{ marginTop: 8 }}>Voir tous les cours</Link>
        )}
      </div>

      <ChargementFluide
        isLoading={loading}
        squelette={
          <div className="grille-cartes">
            {Array.from({ length: 6 }, (_, i) => <SqueletteCarteCours key={i} />)}
          </div>
        }
      >
        {cours.length > 0 ? (
          <div className="grille-cartes">
            {cours.map(c => (
              <Link key={c.id} to={`/cours/${c.id}`} className="carte-cours">
                <div className="carte-cours-header">
                  <span className="matiere-tag">{c.matiere?.nom}</span>
                  <div className="carte-cours-badges">
                    {c.termine && (
                      <span className="badge badge-termine"><Check size={13} strokeWidth={3} /> Terminé</span>
                    )}
                    {c.favori && (
                      <Bookmark size={15} fill="var(--couleur-accent)" color="var(--couleur-accent)" />
                    )}
                  </div>
                </div>
                <h3>{c.titre}</h3>
                <p>{c.description?.split(' ').slice(0, 20).join(' ')}{c.description?.split(' ').length > 20 ? '…' : ''}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="carte">
            <div className="etat-vide">
              <p>
                {isFavorisView
                  ? "Tu n'as encore aucun cours en favoris. Utilise l'icône Bookmark sur un cours pour l'ajouter."
                  : "Aucun cours n'est encore disponible pour ta classe et ta série. Reviens bientôt !"}
              </p>
              {isFavorisView && <Link to="/cours" className="btn btn-primaire">Parcourir les cours</Link>}
            </div>
          </div>
        )}
      </ChargementFluide>
    </main>
  )
}
