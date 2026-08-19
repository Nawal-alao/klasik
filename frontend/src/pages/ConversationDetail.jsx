import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/axios'
import AvatarInitiales from '../components/AvatarInitiales'

function formaterDateComplete(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const jour = d.getDate()
  const mois = d.toLocaleDateString('fr-FR', { month: 'long' })
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${jour} ${mois}, ${heure}`
}

export default function ConversationDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { notifier } = useNotification()
  const [suivi, setSuivi] = useState(null)
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    api.get(`communaute/conversations/${id}/`).then(r => {
      setSuivi(r.data)
      setMessages(r.data.messages || [])
      // Mark messages as read
      api.post(`communaute/conversations/${id}/`)
    })
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
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }).catch(() => {
      notifier('Une erreur est survenue, réessaie dans un instant.', 'error')
    }).finally(() => setSending(false))
  }

  if (!suivi) return <main><div className="etat-vide"><p>Chargement…</p></div></main>

  const prenomInterlocuteur = suivi.interlocuteur_prenom || ''
  const nomInterlocuteur = suivi.interlocuteur?.split(' ').slice(1).join(' ') || ''

  return (
    <main className="conversation-detail-page">
      <p className="fil-ariane">
        <Link to="/conversations">Mes conversations</Link> / {suivi.interlocuteur}
      </p>

      <div className="conversation-entete">
        <AvatarInitiales prenom={prenomInterlocuteur} nom={nomInterlocuteur} taille={44} />
        <div className="conversation-entete-info">
          <h2>{suivi.interlocuteur}</h2>
          <div className="conversation-entete-meta">
            <span className="matiere-tag">{suivi.matiere}</span>
            <span className="texte-doux">{suivi.sous_texte}</span>
          </div>
        </div>
      </div>

      <div className="fil-messages conversation-fil">
        {messages.length > 0 ? messages.map(m => {
          const estMien = m.auteur?.id === user?.id || m.auteur?.username === user?.username
          const prenomAuteur = estMien ? (user?.prenom || '') : prenomInterlocuteur
          const nomAuteur = estMien ? (user?.nom || '') : nomInterlocuteur

          return (
            <div key={m.id} className={`message-bulle ${estMien ? 'message-mien' : 'message-autre'}`}>
              {!estMien && (
                <AvatarInitiales prenom={prenomAuteur} nom={nomAuteur} taille={32} />
              )}
              <div className={`message-conteneur ${estMien ? 'conteneur-mien' : 'conteneur-autre'}`}>
                <div className="message-entete">
                  <span className="message-auteur">{prenomAuteur}</span>
                  <span className="message-date">{formaterDateComplete(m.date_envoi)}</span>
                </div>
                <div className={`message-bulle-texte ${estMien ? 'bulle-mien' : 'bulle-autre'}`}>
                  <p className="message-contenu">{m.contenu}</p>
                </div>
              </div>
              {estMien && (
                <AvatarInitiales prenom={prenomAuteur} nom={nomAuteur} taille={32} />
              )}
            </div>
          )
        }) : (
          <div className="etat-vide">
            <p>Aucun message pour le moment. Lance la conversation !</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="barre-saisie">
        <form onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Écris ton message…"
            required
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            className="barre-saisie-input"
          />
          <button type="submit" className="barre-saisie-btn" disabled={sending || !contenu.trim()}>
            <Send size={18} strokeWidth={2} />
          </button>
        </form>
      </div>
    </main>
  )
}
