import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import renderMathInElement from 'katex/contrib/auto-render'
import api from '../api/axios'

const KATEX_DELIMITERS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ],
  throwOnError: false,
}

function KaTeXText({ text }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) renderMathInElement(ref.current, KATEX_DELIMITERS)
  }, [text])
  return <span ref={ref}>{text}</span>
}

export default function ResultatDetail() {
  const { id } = useParams()
  const [resultat, setResultat] = useState(null)

  useEffect(() => {
    api.get(`evaluations/resultats/${id}/`).then(r => setResultat(r.data))
  }, [id])

  if (!resultat) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  const note = Number(resultat.note)
  const reponses = resultat.reponses || []

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/examens">Mes examens</Link> / Résultat
      </p>

      <div className="resultat-hero">
        <div className="note-geante">{note.toFixed(1)}</div>
        <div className="note-sur">/ 20</div>
      </div>

      <div className="entete-page">
        <p className="eyebrow">{resultat.examen?.matiere?.nom}</p>
        <h1>{resultat.examen?.titre}</h1>
      </div>

      <div className="carte">
        {reponses.map((r, i) => (
          <div key={r.id} className="reponse-ligne">
            <div className={`puce ${r.correct ? 'puce-correct' : 'puce-incorrect'}`}>
              {r.correct ? '✓' : '✗'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>
                Question {i + 1} — {r.question?.notion}
              </p>
              <p style={{ marginBottom: 4 }}>
                Ta réponse : <strong><KaTeXText text={r.reponse_donnee || '—'} /></strong>
              </p>
              {!r.correct && (
                <p style={{ color: 'var(--couleur-succes)', marginBottom: 0 }}>
                  Bonne réponse : <strong><KaTeXText text={r.question?.bonne_reponse || '—'} /></strong>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link to="/examens" className="btn btn-secondaire">Retour aux examens</Link>
      </div>
    </main>
  )
}
