import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, userType } = useAuth()

  const actionsNonConnecte = (
    <>
      <Link to="/inscription/eleve" className="btn btn-primaire">Je suis élève</Link>
      <Link to="/inscription/mentor" className="btn btn-secondaire">Je suis mentor</Link>
    </>
  )

  const actionsConnecte = (
    <Link
      to={userType === 'mentor' ? '/dashboard/mentor' : '/dashboard/eleve'}
      className="btn btn-primaire"
    >
      Aller à mon tableau de bord
    </Link>
  )

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Système éducatif béninois</p>
        <h1>Des cours pensés pour ta classe, ta série, et toi.</h1>
        <p className="sous-titre">
          Klasik personnalise chaque cours selon ton niveau, te connecte à de vrais mentors,
          et suit ta progression matière par matière.
        </p>
        <div className="hero-actions">
          {user ? actionsConnecte : actionsNonConnecte}
        </div>
      </section>

      <section className="section-fonctionnalites">
        <p className="section-eyebrow">Comment ça marche</p>
        <h2>Une plateforme construite autour de ton parcours scolaire</h2>

        <div className="grille-cartes">
          <div className="carte-fonctionnalite">
            <div className="numero">01</div>
            <h3>Cours personnalisés</h3>
            <p>Chaque cours est filtré selon ta classe et ta série, tirés directement des manuels officiels et validés par de vrais professeurs.</p>
          </div>
          <div className="carte-fonctionnalite">
            <div className="numero">02</div>
            <h3>Mentors humains</h3>
            <p>Suis plusieurs mentors selon les matières, et évalue-les pour aider les autres élèves à trouver le bon accompagnement.</p>
          </div>
          <div className="carte-fonctionnalite">
            <div className="numero">03</div>
            <h3>Progression suivie</h3>
            <p>Chaque examen affine ton profil, matière par matière, notion par notion, pour cibler exactement ce qu'il te reste à travailler.</p>
          </div>
          <div className="carte-fonctionnalite">
            <div className="numero">04</div>
            <h3>Communauté par série</h3>
            <p>Rejoins des groupes d'étude avec des élèves de ta classe et ta série, pour apprendre ensemble, pas tout seul.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
