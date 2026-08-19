import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, MessageCircle } from 'lucide-react'
import api from '../api/axios'
import AvatarInitiales from '../components/AvatarInitiales'
import Squelette from '../components/Squelette'
import ChargementFluide from '../components/ChargementFluide'

function normaliser(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formaterDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const auj = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const hier = new Date(auj); hier.setDate(hier.getDate() - 1)
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (msgDate.getTime() === auj.getTime()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  if (msgDate.getTime() === hier.getTime()) {
    return 'Hier'
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function SqueletteConversation() {
  return (
    <div className="conversation-item" style={{ pointerEvents: 'none' }}>
      <Squelette largeur={48} hauteur={48} arrondi="50%" />
      <div className="conversation-corps">
        <div className="conversation-tete">
          <Squelette largeur={120} hauteur={16} />
          <Squelette largeur={64} hauteur={20} arrondi="999px" />
        </div>
        <Squelette largeur="90%" hauteur={14} />
      </div>
    </div>
  )
}

export default function Conversations() {
  const [suivis, setSuivis] = useState([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('communaute/conversations/').then(r => setSuivis(r.data)).finally(() => setLoading(false))
  }, [])

  const filtres = useMemo(() => {
    const q = normaliser(recherche)
    if (!q) return suivis
    return suivis.filter(s =>
      normaliser(s.interlocuteur).includes(q) || normaliser(s.matiere).includes(q)
    )
  }, [suivis, recherche])

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Messagerie</p>
        <h1>Mes conversations</h1>
        <p className="texte-doux">Échanges privés avec tes mentors, matière par matière.</p>
      </div>

      <div className="barre-recherche" style={{ marginBottom: 24 }}>
        <Search size={16} strokeWidth={2} className="barre-recherche-icone" />
        <input
          type="text"
          placeholder="Rechercher une conversation…"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
      </div>

      <ChargementFluide
        isLoading={loading}
        squelette={
          <div className="liste-conversations">
            {Array.from({ length: 4 }, (_, i) => <SqueletteConversation key={i} />)}
          </div>
        }
      >
        {filtres.length > 0 ? (
          <div className="liste-conversations">
            {filtres.map(s => (
              <Link key={s.id} to={`/conversations/${s.id}`} className="conversation-item">
                <AvatarInitiales prenom={s.interlocuteur_prenom} nom={s.interlocuteur?.split(' ').slice(1).join(' ')} taille={48} />
                <div className="conversation-corps">
                  <div className="conversation-tete">
                    <span className="conversation-nom">{s.interlocuteur}</span>
                    <span className="matiere-tag">{s.matiere}</span>
                  </div>
                  <div className="conversation-apercu">
                    <p className="conversation-dernier-msg">
                      {s.dernier_message || 'Aucun message pour le moment.'}
                    </p>
                    {s.dernier_message_date && (
                      <span className="conversation-date">{formaterDate(s.dernier_message_date)}</span>
                    )}
                  </div>
                </div>
                {s.messages_non_lus > 0 && (
                  <span className="badge-non-lus">{s.messages_non_lus}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="carte">
            <div className="etat-vide">
              <div className="etat-vide-icone">
                <MessageCircle size={40} strokeWidth={1.2} />
              </div>
              <p>Tes conversations apparaîtront ici.</p>
              <p className="texte-doux" style={{ fontSize: '0.9rem', marginTop: -12 }}>
                Commence à échanger avec tes mentors pour voir tes discussions ici.
              </p>
            </div>
          </div>
        )}
      </ChargementFluide>
    </main>
  )
}
