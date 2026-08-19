import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageCircleQuestion } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/axios'
import AvatarInitiales from '../components/AvatarInitiales'

function normaliser(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function Mentors() {
  const { user } = useAuth()
  const { notifier } = useNotification()
  const navigate = useNavigate()
  const [mentors, setMentors] = useState([])
  const [matieres, setMatieres] = useState([])
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const [recherche, setRecherche] = useState('')
  const [suivreMessage, setSuivreMessage] = useState('')
  const [showAide, setShowAide] = useState(false)
  const [aideTexte, setAideTexte] = useState('')

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

  const mentorsFiltres = useMemo(() => {
    const q = normaliser(recherche)
    if (!q) return mentors
    return mentors.filter(m =>
      normaliser(m.prenom).includes(q) || normaliser(m.nom).includes(q)
    )
  }, [mentors, recherche])

  const handleSuivre = (mentorId, matiereId, mentorPrenom, matiereNom) => {
    setSuivreMessage('')
    api.post(`comptes/mentors/${mentorId}/suivre/`, { matiere: matiereId })
      .then(() => {
        setSuivreMessage('Mentor ajouté !')
        notifier(`Tu suis maintenant ${mentorPrenom} en ${matiereNom}.`, 'success')
      })
      .catch(err => {
        const detail = err.response?.data?.detail
        if (detail) {
          setSuivreMessage(detail)
          if (detail.includes('déjà')) {
            notifier("Tu suis déjà ce mentor dans cette matière.", 'info')
          } else if (err.response?.status === 403 || detail.toLowerCase().includes('abonnement')) {
            notifier("Un abonnement actif est nécessaire pour suivre un mentor.", 'warning')
            navigate('/abonnement')
          } else {
            notifier(detail, 'error')
          }
        } else {
          setSuivreMessage('Erreur')
          notifier('Une erreur est survenue, réessaie dans un instant.', 'error')
        }
      })
  }

  const handleAide = (e) => {
    e.preventDefault()
    setShowAide(false)
    setAideTexte('')
    notifier('Merci, ta demande a été prise en compte, on te recontacte bientôt !', 'success')
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
        <div className="barre-recherche">
          <Search size={16} strokeWidth={2} className="barre-recherche-icone" />
          <input
            type="text"
            placeholder="Rechercher un mentor…"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
          />
        </div>
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

      {mentorsFiltres.length > 0 ? (
        <div className="grille-cartes">
          {mentorsFiltres.map(m => {
            const uneSeuleMatiere = m.matieres_detail?.length === 1
            const matiereUnique = uneSeuleMatiere ? m.matieres_detail[0] : null

            return (
              <div key={m.id} className="carte-mentor">
                <div className="carte-mentor-haut">
                  <AvatarInitiales prenom={m.prenom} nom={m.nom} taille={52} />
                  <div className="entete-mentor">
                    <h3>{m.prenom} {m.nom}</h3>
                    {m.note_moyenne != null && (
                      <span className="note">★ {Number(m.note_moyenne).toFixed(1)}/5</span>
                    )}
                  </div>
                </div>
                {m.bio && <p className="bio">{m.bio.split(' ').slice(0, 24).join(' ')}{m.bio.split(' ').length > 24 ? '…' : ''}</p>}
                <div className="tags-matieres">
                  {m.matieres_detail?.map(mt => (
                    <span key={mt.id} className="matiere-tag">{mt.nom}</span>
                  ))}
                </div>
                {uneSeuleMatiere ? (
                  <button
                    type="button"
                    className="btn btn-primaire carte-mentor-btn"
                    onClick={() => handleSuivre(m.id, matiereUnique.id, m.prenom, matiereUnique.nom)}
                  >
                    Suivre en {matiereUnique.nom}
                  </button>
                ) : (
                  <form onSubmit={e => {
                    e.preventDefault()
                    const fd = new FormData(e.target)
                    const mtId = fd.get('matiere')
                    const mt = m.matieres_detail?.find(x => String(x.id) === String(mtId))
                    handleSuivre(m.id, mtId, m.prenom, mt?.nom || '')
                  }}>
                    <select name="matiere" required>
                      {m.matieres_detail?.map(mt => (
                        <option key={mt.id} value={mt.id}>{mt.nom}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primaire">Suivre</button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Aucun mentor disponible pour cette matière pour le moment.</p>
          </div>
        </div>
      )}

      <div className="carte-aide">
        <div className="carte-aide-icon">
          <MessageCircleQuestion size={28} strokeWidth={1.8} />
        </div>
        <div className="carte-aide-texte">
          <h3>Tu ne trouves pas le mentor qu'il te faut ?</h3>
          <p>Fais-nous savoir la matière ou le sujet, on t'aidera à trouver la bonne personne.</p>
        </div>
        <button type="button" className="btn btn-primaire" onClick={() => setShowAide(true)}>
          Demander de l'aide
        </button>
      </div>

      {showAide && (
        <dialog open className="dialogue" onClose={() => setShowAide(false)}>
          <h3>Demande d'aide</h3>
          <p className="texte-doux" style={{ marginBottom: 16, fontSize: '0.88rem' }}>
            Décris ce que tu cherches.
          </p>
          <form onSubmit={handleAide}>
            <textarea rows="3" placeholder="Décris ce que tu cherches" required
              value={aideTexte} onChange={e => setAideTexte(e.target.value)} />
            <div className="actions-dialogue">
              <button type="button" className="btn btn-secondaire" style={{ flex: 1 }}
                onClick={() => setShowAide(false)}>Annuler</button>
              <button type="submit" className="btn btn-primaire" style={{ flex: 1 }}>Envoyer</button>
            </div>
          </form>
        </dialog>
      )}
    </main>
  )
}
