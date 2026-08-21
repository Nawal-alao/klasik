import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import renderMathInElement from 'katex/contrib/auto-render'
import { useNotification } from '../context/NotificationContext'
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

function EnonceAvecMath({ html }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = DOMPurify.sanitize(html)
      renderMathInElement(ref.current, KATEX_DELIMITERS)
    }
  }, [html])
  return <div className="enonce" ref={ref} />
}

export default function PasserExamen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notifier } = useNotification()
  const [examen, setExamen] = useState(null)
  const [questions, setQuestions] = useState([])
  const [reponses, setReponses] = useState({})
  const [sending, setSending] = useState(false)

  useEffect(() => {
    api.get(`evaluations/examens/${id}/passer/`).then(r => {
      setExamen(r.data.examen)
      setQuestions(r.data.questions)
    })
  }, [id])

  const setReponse = (qId, value) => {
    setReponses(prev => ({ ...prev, [qId]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    const payload = {
      reponses: questions.map(q => ({
        question_id: q.id,
        reponse: reponses[q.id] || '',
      })),
    }
    api.post(`evaluations/examens/${id}/soumettre/`, payload).then(r => {
      notifier('Examen soumis avec succès !', 'success')
      navigate(`/resultats/${r.data.id}`)
    }).catch(() => {
      setSending(false)
      notifier("L'envoi de tes réponses a échoué, réessaie.", 'error')
    })
  }

  if (!examen) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/examens">Mes examens</Link> / {examen.matiere?.nom}
      </p>

      <div className="entete-page">
        <p className="eyebrow">{examen.matiere?.nom}</p>
        <h1>{examen.titre}</h1>
        <p className="texte-doux">
          {questions.length} question{questions.length > 1 ? 's' : ''} — réponds du mieux que tu peux, tu peux revenir en arrière avant de valider.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {questions.map((q, i) => (
          <div key={q.id} className="question-bloc">
            <p className="numero-question">Question {i + 1} / {questions.length}</p>
            <EnonceAvecMath html={q.enonce} />

            {q.type_question === 'QCM' && q.choix_reponses ? (
              q.choix_reponses.map((choix, ci) => (
                <div key={ci} className="choix-reponse">
                  <input type="radio" id={`q${q.id}-c${ci}`} name={`q${q.id}`}
                    value={choix} required
                    checked={reponses[q.id] === choix}
                    onChange={() => setReponse(q.id, choix)} />
                  <label htmlFor={`q${q.id}-c${ci}`}><KaTeXText text={choix} /></label>
                </div>
              ))
            ) : (
              <input type="text" placeholder="Ta réponse" required
                value={reponses[q.id] || ''}
                onChange={(e) => setReponse(q.id, e.target.value)} />
            )}
          </div>
        ))}

        <div className="barre-actions-examen">
          <button type="submit" className="btn btn-primaire" disabled={sending}>
            {sending ? 'Envoi…' : 'Valider mes réponses'}
          </button>
        </div>
      </form>
    </main>
  )
}
