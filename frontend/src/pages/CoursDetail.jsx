import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import api from '../api/axios'

const CLASSES_LABEL = {
  '6EME': 'Sixième', '5EME': 'Cinquième', '4EME': 'Quatrième',
  '3EME': 'Troisième', '2ND': 'Seconde', '1ERE': 'Première', 'TLE': 'Terminale',
}

export default function CoursDetail() {
  const { id } = useParams()
  const [cours, setCours] = useState(null)
  const [activeSeq, setActiveSeq] = useState(null)

  useEffect(() => {
    api.get(`pedagogie/cours/${id}/`).then(r => {
      setCours(r.data)
      if (r.data.sequences?.length) setActiveSeq(r.data.sequences[0].id)
    })
  }, [id])

  if (!cours) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  const sequences = cours.sequences || []

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/cours">Mes cours</Link> / {cours.matiere?.nom}
      </p>

      <div className="entete-page">
        <p className="eyebrow">{cours.matiere?.nom} · {CLASSES_LABEL[cours.classe_scolaire] || cours.classe_scolaire}</p>
        <h1>{cours.titre}</h1>
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
