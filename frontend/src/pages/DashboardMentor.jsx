import React, { useState, useEffect } from 'react'
import { Users, Activity, Star, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import useCompteurAnime from '../hooks/useCompteurAnime'
import Squelette from '../components/Squelette'
import ChargementFluide from '../components/ChargementFluide'

export default function DashboardMentor() {
  const { user } = useAuth()
  const [suivis, setSuivis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('comptes/suivis-mentor/').then(r => setSuivis(r.data)).finally(() => setLoading(false))
  }, [])

  if (!user) return null
  const matieres = user.matieres_detail?.map(m => m.nom).join(' · ') || ''
  const elevesUniques = [...new Map(suivis.map(s => [s.eleve, s])).values()]
  const actifs = suivis.filter(s => s.actif)

  const elevesAnime = useCompteurAnime(elevesUniques.length)
  const actifsAnime = useCompteurAnime(actifs.length)

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Tableau de bord mentor</p>
        <h1>Salut {user.prenom} 👋</h1>
        <p className="texte-doux">{matieres}</p>
      </div>

      <ChargementFluide
        isLoading={loading}
        squelette={
          <>
            <div className="grille-stats">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="stat-carte">
                  <div className="stat-carte-haut">
                    <Squelette largeur={42} hauteur={42} arrondi="50%" />
                    <Squelette largeur={80} hauteur={32} />
                  </div>
                  <Squelette largeur="55%" hauteur={14} style={{ marginTop: 6 }} />
                  <Squelette largeur="80%" hauteur={12} style={{ marginTop: 4 }} />
                </div>
              ))}
            </div>
            <div className="section-titre"><h2>Mes élèves</h2></div>
            <div className="carte">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--couleur-bordure)' : 'none' }}>
                  <div>
                    <Squelette largeur={140} hauteur={16} style={{ marginBottom: 4 }} />
                    <Squelette largeur={100} hauteur={12} />
                  </div>
                  <Squelette largeur={64} hauteur={24} arrondi="999px" />
                </div>
              ))}
            </div>
          </>
        }
      >
        <div className="grille-stats">
          <div className="stat-carte">
            <div className="stat-carte-haut">
              <div className="stat-carte-icon bleu">
                <Users size={20} strokeWidth={2} />
              </div>
              <div className="valeur">{elevesAnime}</div>
            </div>
            <div className="label">Élève{elevesUniques.length > 1 ? 's' : ''} suivi{elevesUniques.length > 1 ? 's' : ''}</div>
            <p className="stat-carte-desc">Total d'élèves inscrits sous ton encadrement</p>
          </div>

          <div className="stat-carte">
            <div className="stat-carte-haut">
              <div className="stat-carte-icon vert">
                <Activity size={20} strokeWidth={2} />
              </div>
              <div className="valeur">{actifsAnime}</div>
            </div>
            <div className="label">Suivi{actifs.length > 1 ? 's' : ''} actif{actifs.length > 1 ? 's' : ''}</div>
            <p className="stat-carte-desc">Élèves avec qui tu échanges en ce moment</p>
          </div>

          <div className="stat-carte">
            <div className="stat-carte-haut">
              <div className="stat-carte-icon accent">
                <Star size={20} strokeWidth={2} />
              </div>
              <div className="valeur">{user.note_moyenne != null ? `${Number(user.note_moyenne).toFixed(1)}/5` : '—'}</div>
            </div>
            <div className="label">Note moyenne</div>
            <p className="stat-carte-desc">Appréciation donnée par tes élèves</p>
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
              <div className="etat-vide-icone">
                <GraduationCap size={40} strokeWidth={1.2} />
              </div>
              <p>Aucun élève ne te suit encore.</p>
              <p className="texte-doux" style={{ fontSize: '0.9rem' }}>
                Ton profil deviendra visible une fois les élèves inscrits sur la plateforme.
              </p>
            </div>
          )}
        </div>
      </ChargementFluide>
    </main>
  )
}
