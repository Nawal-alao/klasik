import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/axios'

export default function GroupeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { notifier } = useNotification()
  const [groupe, setGroupe] = useState(null)
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [signalMsg, setSignalMsg] = useState({ open: false, messageId: null, motif: '' })
  const bottomRef = useRef(null)

  const load = () => {
    api.get(`communaute/groupes/${id}/`).then(r => {
      setGroupe(r.data)
      setMessages(r.data.messages || [])
    })
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!contenu.trim()) return
    setSending(true)
    api.post(`communaute/groupes/${id}/envoyer/`, { contenu }).then(r => {
      setMessages(prev => [...prev, r.data])
      setContenu('')
    }).catch(() => {
      notifier('Une erreur est survenue, réessaie dans un instant.', 'error')
    }).finally(() => setSending(false))
  }

  const handleSignal = (e) => {
    e.preventDefault()
    api.post(`communaute/messages/${signalMsg.messageId}/signaler/`, { motif: signalMsg.motif })
      .then(() => {
        setSignalMsg({ open: false, messageId: null, motif: '' })
        notifier('Ton signalement a bien été enregistré.', 'success')
      })
      .catch(err => {
        const detail = err.response?.data?.detail
        if (detail && detail.includes('déjà')) {
          notifier('Tu as déjà signalé ce message.', 'info')
        } else {
          notifier(detail || 'Une erreur est survenue, réessaie dans un instant.', 'error')
        }
        setSignalMsg({ open: false, messageId: null, motif: '' })
      })
  }

  if (!groupe) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/communaute">Communauté</Link> / {groupe.matiere?.nom || groupe.matiere}
      </p>

      <div className="entete-page">
        <p className="eyebrow">{groupe.matiere?.nom || groupe.matiere} · {groupe.classe_scolaire}</p>
        <h1>{groupe.nom}</h1>
      </div>

      <div className="fil-messages">
        {messages.length > 0 ? messages.map(m => (
          <div key={m.id} className="message-bulle">
            <div className="message-entete">
              <span className="message-auteur">{m.auteur?.username || m.auteur}</span>
              <span className="message-date">{new Date(m.date_envoi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="message-contenu">{m.contenu}</p>
            <div className="message-actions">
              <button type="button" className="lien-signaler"
                onClick={() => setSignalMsg({ open: true, messageId: m.id, motif: '' })}>
                Signaler
              </button>
            </div>
          </div>
        )) : (
          <div className="carte">
            <div className="etat-vide">
              <p>Aucun message pour le moment. Sois le premier à lancer la discussion !</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="formulaire-message">
        <form onSubmit={handleSend}>
          <textarea rows="1" placeholder="Écris un message au groupe…" required
            value={contenu} onChange={e => setContenu(e.target.value)} />
          <button type="submit" className="btn btn-primaire" disabled={sending}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </form>
      </div>

      {signalMsg.open && (
        <dialog open className="dialogue" onClose={() => setSignalMsg({ open: false, messageId: null, motif: '' })}>
          <h3>Signaler ce message</h3>
          <p className="texte-doux" style={{ marginBottom: 16, fontSize: '0.88rem' }}>
            Explique brièvement le problème, un mentor va l'examiner.
          </p>
          <form onSubmit={handleSignal}>
            <textarea rows="3" placeholder="Motif du signalement" required
              value={signalMsg.motif} onChange={e => setSignalMsg(prev => ({ ...prev, motif: e.target.value }))} />
            <div className="actions-dialogue">
              <button type="button" className="btn btn-secondaire" style={{ flex: 1 }}
                onClick={() => setSignalMsg({ open: false, messageId: null, motif: '' })}>Annuler</button>
              <button type="submit" className="btn btn-primaire" style={{ flex: 1 }}>Envoyer</button>
            </div>
          </form>
        </dialog>
      )}
    </main>
  )
}
