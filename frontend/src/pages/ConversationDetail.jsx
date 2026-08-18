import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function ConversationDetail() {
  const { id } = useParams()
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get(`communaute/conversations/${id}/`).then(r => setMessages(r.data.messages || []))
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!contenu.trim()) return
    setSending(true)
    api.post(`communaute/conversations/${id}/envoyer/`, { contenu }).then(r => {
      setMessages(prev => [...prev, r.data])
      setContenu('')
    }).finally(() => setSending(false))
  }

  return (
    <main>
      <p className="fil-ariane">
        <Link to="/conversations">Mes conversations</Link> / Conversation
      </p>

      <div className="fil-messages">
        {messages.length > 0 ? messages.map(m => (
          <div key={m.id} className="message-bulle">
            <div className="message-entete">
              <span className="message-auteur">{m.auteur?.username || m.auteur}</span>
              <span className="message-date">{new Date(m.date_envoi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="message-contenu">{m.contenu}</p>
          </div>
        )) : (
          <div className="carte">
            <div className="etat-vide">
              <p>Aucun message pour le moment. Lance la conversation !</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="formulaire-message">
        <form onSubmit={handleSend}>
          <textarea rows="1" placeholder="Écris ton message…" required
            value={contenu} onChange={e => setContenu(e.target.value)} />
          <button type="submit" className="btn btn-primaire" disabled={sending}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </form>
      </div>
    </main>
  )
}
