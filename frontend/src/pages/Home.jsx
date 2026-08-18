import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, TrendingUp, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const fonctionnalites = [
  {
    icon: BookOpen,
    titre: 'Cours personnalisés',
    description: 'Chaque cours est filtré selon ta classe et ta série, tirés directement des manuels officiels et validés par de vrais professeurs.',
  },
  {
    icon: Users,
    titre: 'Mentors humains',
    description: 'Suis plusieurs mentors selon les matières, et évalue-les pour aider les autres élèves à trouver le bon accompagnement.',
  },
  {
    icon: TrendingUp,
    titre: 'Progression suivie',
    description: 'Chaque examen affine ton profil, matière par matière, notion par notion, pour cibler exactement ce qu\'il te reste à travailler.',
  },
  {
    icon: MessageCircle,
    titre: 'Communauté par série',
    description: 'Rejoins des groupes d\'étude avec des élèves de ta classe et ta série, pour apprendre ensemble, pas tout seul.',
  },
]

export default function Home() {
  const { user, userType } = useAuth()

  return (
    <main className="page-accueil">
      <section className="hero">
        <p className="eyebrow">Système éducatif béninois</p>
        <h1>Des cours pensés pour ta classe, ta série, et toi.</h1>
        <p className="sous-titre">
          Klasik personnalise chaque cours selon ton niveau, te connecte à de vrais mentors,
          et suit ta progression matière par matière.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link
              to={userType === 'mentor' ? '/dashboard/mentor' : '/dashboard/eleve'}
              className="btn btn-primaire"
            >
              Aller à mon tableau de bord
            </Link>
          ) : (
            <>
              <Link to="/inscription/eleve" className="btn btn-primaire">Je suis élève</Link>
              <Link to="/inscription/mentor" className="btn btn-secondaire">Je suis mentor</Link>
            </>
          )}
        </div>

        <div className="hero-illustration">
          <div className="hero-placeholder">
            <BookOpen size={48} strokeWidth={1.2} />
            <p>Image d'illustration à venir</p>
          </div>
        </div>
      </section>

      <section className="section-fonctionnalites">
        <p className="section-eyebrow">Comment ça marche</p>
        <h2>Une plateforme construite autour de ton parcours scolaire</h2>

        <div className="grille-cartes">
          {fonctionnalites.map((f) => (
            <div key={f.titre} className="carte-fonctionnalite">
              <div className="icone-fonctionnalite">
                <f.icon size={28} strokeWidth={1.5} />
              </div>
              <h3>{f.titre}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
