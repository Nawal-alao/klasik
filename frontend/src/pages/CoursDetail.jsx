import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { Check, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/axios'

const CLASSES_LABEL = {
  '6EME': 'Sixième', '5EME': 'Cinquième', '4EME': 'Quatrième',
  '3EME': 'Troisième', '2ND': 'Seconde', '1ERE': 'Première', 'TLE': 'Terminale',
}

export default function CoursDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { notifier } = useNotification()
  const [cours, setCours] = useState(null)
  const [activeSeq, setActiveSeq] = useState(null)
  const [termine, setTermine] = useState(false)
  const [loadingTermine, setLoadingTermine] = useState(false)
  const [favori, setFavori] = useState(false)
  const [loadingFavori, setLoadingFavori] = useState(false)

  const isEleve = user?.classe_scolaire !== undefined

  useEffect(() => {
    api.get(`pedagogie/cours/${id}/`).then(r => {
      setCours(r.data)
      setTermine(r.data.termine)
      setFavori(r.data.favori)
      if (r.data.sequences?.length) setActiveSeq(r.data.sequences[0].id)
    })
  }, [id])

  const toggleTermine = () => {
    setLoadingTermine(true)
    api.post(`pedagogie/cours/${id}/terminer/`).then(r => {
      setTermine(r.data.termine)
      if (r.data.termine) {
        notifier('Cours marqué comme terminé, bravo !', 'success')
      } else {
        notifier('Cours retiré de tes cours terminés.', 'info')
      }
    }).catch(() => {
      notifier('Une erreur est survenue, réessaie dans un instant.', 'error')
    }).finally(() => setLoadingTermine(false))
  }

  const toggleFavori = () => {
    setLoadingFavori(true)
    api.post(`pedagogie/cours/${id}/favori/`).then(r => {
      setFavori(r.data.favori)
      if (r.data.favori) {
        notifier('Ajouté à tes favoris.', 'success')
      } else {
        notifier('Retiré de tes favoris.', 'info')
      }
    }).catch(() => {
      notifier('Une erreur est survenue, réessaie dans un instant.', 'error')
    }).finally(() => setLoadingFavori(false))
  }

  if (!cours) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  const sequences = cours.sequences || []
  const activeIdx = sequences.findIndex(s => s.id === activeSeq)
  const hasPrev = activeIdx > 0
  const hasNext = activeIdx < sequences.length - 1
  const classeLabel = CLASSES_LABEL[cours.classe_scolaire] || cours.classe_scolaire

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/cours">Mes cours</Link> / {classeLabel} / {cours.titre}
      </p>

      <div className="entete-page">
        <p className="eyebrow">{classeLabel}</p>
        <div className="ligne-titre-cours">
          <h1>{cours.titre}</h1>
          {isEleve && (
            <div className="actions-cours">
              <button
                type="button"
                className={`bouton-favori${favori ? ' actif' : ''}`}
                onClick={toggleFavori}
                disabled={loadingFavori}
                aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Bookmark size={16} fill={favori ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                className={`bouton-terminer ${termine ? 'actif' : ''}`}
                onClick={toggleTermine}
                disabled={loadingTermine}
              >
                {termine ? (
                  <span className="badge badge-termine"><Check size={14} strokeWidth={3} /> Terminé</span>
                ) : (
                  <><Check size={16} /> Marquer comme terminé</>
                )}
              </button>
            </div>
          )}
        </div>
        {cours.description && <p className="texte-doux">{cours.description}</p>}
      </div>

      {sequences.length > 0 ? (
        <div className="mise-en-page-cours">
          <nav className="sommaire-sequences">
            <div className="sommaire-titre">Contenu du cours</div>
            {termine !== undefined && (
              <div className="sommaire-badge">
                {termine ? (
                  <span className="badge badge-termine"><Check size={12} strokeWidth={3} /> Terminé</span>
                ) : (
                  <span className="badge badge-inactif">En cours</span>
                )}
              </div>
            )}
            {sequences.map((seq, idx) => (
              <a key={seq.id} href={`#sequence-${seq.id}`}
                className={`sommaire-item${activeSeq === seq.id ? ' actif' : ''}`}
                onClick={() => setActiveSeq(seq.id)}>
                <span className="sommaire-num">{idx + 1}</span>
                <span>{seq.titre}</span>
              </a>
            ))}
          </nav>
          <div className="cours-contenu-colonne">
            {sequences.map((seq, idx) => (
              <article key={seq.id} className="sequence" id={`sequence-${seq.id}`}>
                <h3>Séquence {seq.ordre}</h3>
                <h2>{seq.titre}</h2>
                <div className="contenu-sequence"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(seq.contenu) }} />
              </article>
            ))}

            <nav className="navigation-sequences">
              <div>
                {hasPrev ? (
                  <Link to="#" className="btn btn-secondaire"
                    onClick={(e) => { e.preventDefault(); setActiveSeq(sequences[activeIdx - 1].id); document.getElementById(`sequence-${sequences[activeIdx - 1].id}`)?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <ChevronLeft size={16} /> Leçon précédente
                  </Link>
                ) : <span />}
              </div>
              <div>
                {hasNext ? (
                  <Link to="#" className="btn btn-primaire"
                    onClick={(e) => { e.preventDefault(); setActiveSeq(sequences[activeIdx + 1].id); document.getElementById(`sequence-${sequences[activeIdx + 1].id}`)?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Leçon suivante <ChevronRight size={16} />
                  </Link>
                ) : <span />}
              </div>
            </nav>
          </div>
        </div>
      ) : (
        <div className="carte">
          <div className="etat-vide">
            <p>Le contenu de ce cours arrive bientôt.</p>
          </div>
        </div>
      )}
    </main>
  )
}
