import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Users, CreditCard, CalendarDays } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CLASSES_LABEL = {
  '6EME': 'Sixième', '5EME': 'Cinquième', '4EME': 'Quatrième',
  '3EME': 'Troisième', '2ND': 'Seconde', '1ERE': 'Première', 'TLE': 'Terminale',
}

export default function DashboardEleve() {
  const { user } = useAuth()
  const [suivis, setSuivis] = useState([])
  const [progressions, setProgressions] = useState([])
  const [abonnement, setAbonnement] = useState(null)

  useEffect(() => {
    api.get('comptes/mes-suivis/').then(r => setSuivis(r.data))
    api.get('evaluations/progressions/').then(r => setProgressions(r.data))
    api.get('abonnements/mon-abonnement/').then(r => setAbonnement(r.data.abonnement_actif))
  }, [])

  const noter = (suiviId, note) => {
    api.post(`comptes/suivis/${suiviId}/noter/`, { note }).then(r => {
      setSuivis(prev => prev.map(s => s.id === suiviId ? { ...s, note_evaluation: note } : s))
    })
  }

  if (!user) return null
  const classeLabel = CLASSES_LABEL[user.classe_scolaire] || user.classe_scolaire
  const inscriptionDate = new Date(user.date_inscription).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Tableau de bord</p>
        <h1>Salut {user.prenom} 👋</h1>
        <p className="texte-doux">{classeLabel}{user.serie !== 'AUCUNE' ? ` · Série ${user.serie}` : ''}</p>
      </div>

      <div className="grille-stats">
        <div className="stat-carte">
          <div className="stat-carte-haut">
            <div className="stat-carte-icon bleu">
              <Users size={20} strokeWidth={2} />
            </div>
            <div className="valeur">{suivis.length}</div>
          </div>
          <div className="label">Mentor{suivis.length > 1 ? 's' : ''} suivi{suivis.length > 1 ? 's' : ''}</div>
          <p className="stat-carte-desc">Accompagnement personnalisé matière par matière</p>
        </div>
        <div className="stat-carte">
          <div className="stat-carte-haut">
            <div className="stat-carte-icon accent">
              <CreditCard size={20} strokeWidth={2} />
            </div>
            <div className="valeur">{abonnement ? 'Actif' : 'Inactif'}</div>
          </div>
          <div className="label">Statut de l'abonnement</div>
          <p className="stat-carte-desc">{abonnement ? `Formule ${abonnement.formule}` : 'Souscris pour débloquer les mentors'}</p>
        </div>
        <div className="stat-carte">
          <div className="stat-carte-haut">
            <div className="stat-carte-icon vert">
              <CalendarDays size={20} strokeWidth={2} />
            </div>
            <div className="valeur">{inscriptionDate}</div>
          </div>
          <div className="label">Membre depuis</div>
          <p className="stat-carte-desc">Rejoins la communauté des élèves béninois</p>
        </div>
      </div>

      <div className="section-titre">
        <h2>Mes mentors</h2>
        <Link to="/mentors">Trouver un mentor →</Link>
      </div>
      <div className="carte" style={{ marginBottom: 40 }}>
        {suivis.length > 0 ? (
          <ul className="liste-simple">
            {suivis.map(s => (
              <li key={s.id}>
                <div>
                  <strong>{s.mentor_name}</strong>
                  <span className="texte-doux"> — {s.matiere_nom}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="notation-mentor">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button"
                        className={s.note_evaluation && i <= s.note_evaluation ? 'remplie' : ''}
                        onClick={() => noter(s.id, i)}
                        title={`Noter ${i}/5`}>★</button>
                    ))}
                  </span>
                  <Link to={`/conversations/${s.id}`} className="btn btn-secondaire">Écrire</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="etat-vide">
            <p>Tu ne suis encore aucun mentor.</p>
            <Link to="/mentors" className="btn btn-primaire">Trouver un mentor</Link>
          </div>
        )}
      </div>

      <div className="section-titre">
        <h2>Ma progression</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/cours/favoris" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Bookmark size={14} /> Favoris
          </Link>
          <Link to="/cours">Voir tous les cours →</Link>
        </div>
      </div>
      <div className="carte" style={{ marginBottom: 40 }}>
        {progressions.length > 0 ? (
          progressions.map(p => (
            <div key={p.id} className="ligne-progression">
              <div style={{ flex: 1 }}>
                <div className="matiere-nom">{p.matiere_nom}</div>
                <div className="barre-progression-conteneur">
                  <div className="barre-progression" style={{ width: `${p.niveau_maitrise}%` }} />
                </div>
              </div>
              <div className="pourcentage">{Math.round(p.niveau_maitrise)}%</div>
            </div>
          ))
        ) : (
          <div className="etat-vide">
            <p>Tu n'as pas encore de progression enregistrée. Passe ton premier examen pour commencer à suivre ton évolution.</p>
            <Link to="/examens" className="btn btn-primaire">Voir les examens disponibles</Link>
          </div>
        )}
      </div>

      <div className="section-titre"><h2>Mon abonnement</h2></div>
      <div className="carte">
        {abonnement ? (
          <>
            <p><span className="badge badge-actif">Actif</span></p>
            <p className="texte-doux" style={{ marginTop: 12 }}>
              Formule {abonnement.formule} — expire le {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
            </p>
            <Link to="/abonnement" className="btn btn-secondaire" style={{ marginTop: 12 }}>Gérer mon abonnement</Link>
          </>
        ) : (
          <div className="etat-vide">
            <p>Tu n'as pas d'abonnement actif. Souscris pour débloquer les mentors et l'accès complet aux cours.</p>
            <Link to="/abonnement" className="btn btn-primaire">Souscrire maintenant</Link>
          </div>
        )}
      </div>
    </main>
  )
}
