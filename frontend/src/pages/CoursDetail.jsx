import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { Check, Bookmark } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CLASSES_LABEL = {
  '6EME': 'Sixième', '5EME': 'Cinquième', '4EME': 'Quatrième',
  '3EME': 'Troisième', '2ND': 'Seconde', '1ERE': 'Première', 'TLE': 'Terminale',
}

export default function CoursDetail() {
  const { id } = useParams()
  const { user } = useAuth()
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
    }).finally(() => setLoadingTermine(false))
  }

  const toggleFavori = () => {
    setLoadingFavori(true)
    api.post(`pedagogie/cours/${id}/favori/`).then(r => {
      setFavori(r.data.favori)
    }).finally(() => setLoadingFavori(false))
  }

  if (!cours) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  const sequences = cours.sequences || []

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/cours">Mes cours</Link> / {cours.matiere?.nom}
      </p>

      <div className="entete-page">
        <p className="eyebrow">{cours.matiere?.nom} · {CLASSES_LABEL[cours.classe_scolaire] || cours.classe_scolaire}</p>
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
                  <>
                    <span className="badge badge-termine"><Check size={14} strokeWidth={3} /> Terminé</span>
                  </>
                ) : (
                  <>
                    <Check size={16} /> Marquer comme terminé
                  </>
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
            {sequences.map(seq => (
              <a key={seq.id} href={`#sequence-${seq.id}`}
                className={activeSeq === seq.id ? 'actif' : ''}
                onClick={() => setActiveSeq(seq.id)}>
                {seq.ordre}. {seq.titre}
              </a>
            ))}
          </nav>
          <div>
            {sequences.map(seq => (
              <article key={seq.id} className="sequence" id={`sequence-${seq.id}`}>
                <h3>Séquence {seq.ordre}</h3>
                <h2>{seq.titre}</h2>
                <div className="contenu-sequence"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(seq.contenu) }} />
              </article>
            ))}
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
