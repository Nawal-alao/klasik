import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import api from '../api/axios'

const FORMULES = { MENSUEL: 'Mensuel', ANNUEL: 'Annuel' }
const STATUTS = { ACTIF: 'Actif', EXPIRE: 'Expiré', ANNULE: 'Annulé' }

export default function Abonnement() {
  const { notifier } = useNotification()
  const [abonnement, setAbonnement] = useState(null)
  const [historique, setHistorique] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [annulant, setAnnulant] = useState(false)

  useEffect(() => {
    api.get('abonnements/mon-abonnement/').then(r => {
      setAbonnement(r.data.abonnement_actif)
      setHistorique(r.data.historique || [])
    })
  }, [])

  const handleAnnuler = () => {
    setAnnulant(true)
    api.post('abonnements/annuler/').then(() => {
      setAbonnement(null)
      setShowDialog(false)
      notifier("Ton abonnement a été annulé.", 'success')
    }).catch(() => {
      notifier("Une erreur est survenue, réessaie dans un instant.", 'error')
    }).finally(() => setAnnulant(false))
  }

  return (
    <main>
      <div className="entete-page">
        <p className="eyebrow">Abonnement</p>
        <h1>Mon abonnement</h1>
      </div>

      <div className="carte" style={{ marginBottom: 32 }}>
        {abonnement ? (
          <>
            <p><span className="badge badge-actif">Actif</span></p>
            <h3 style={{ marginTop: 14 }}>Formule {FORMULES[abonnement.formule] || abonnement.formule}</h3>
            <p className="texte-doux">
              Débuté le {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')} —
              expire le {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
            </p>
            <button type="button" className="btn btn-secondaire" style={{ marginTop: 20 }}
              onClick={() => setShowDialog(true)}>
              Annuler mon abonnement
            </button>
          </>
        ) : (
          <div className="etat-vide">
            <p>Tu n'as pas d'abonnement actif pour le moment. Souscris pour débloquer les mentors et l'accès complet aux cours.</p>
            <Link to="/abonnement" className="btn btn-primaire">Souscrire maintenant</Link>
          </div>
        )}
      </div>

      {historique.length > 0 && (
        <>
          <div className="section-titre"><h2>Historique</h2></div>
          <div className="carte">
            <ul className="liste-simple">
              {historique.map(a => (
                <li key={a.id}>
                  <div>
                    <strong>Formule {FORMULES[a.formule] || a.formule}</strong>
                    <span className="texte-doux">
                      {' '}— du {new Date(a.date_debut).toLocaleDateString('fr-FR')} au {new Date(a.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <span className="badge badge-inactif">{STATUTS[a.statut] || a.statut}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {showDialog && (
        <dialog open className="dialogue" onClose={() => setShowDialog(false)}>
          <h3>Annuler ton abonnement ?</h3>
          <p className="texte-doux">Tu perdras l'accès aux mentors immédiatement. Tu pourras te réabonner à tout moment.</p>
          <div className="actions-dialogue">
            <button type="button" className="btn btn-secondaire" style={{ flex: 1 }}
              onClick={() => setShowDialog(false)}>Garder mon abonnement</button>
            <button type="button" className="btn btn-primaire" style={{ flex: 1 }}
              disabled={annulant} onClick={handleAnnuler}>
              {annulant ? 'Annulation…' : "Confirmer l'annulation"}
            </button>
          </div>
        </dialog>
      )}
    </main>
  )
}
