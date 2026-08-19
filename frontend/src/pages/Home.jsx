import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, TrendingUp, MessageCircle, Shield, Lock, Award, Headphones, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import RevelationScroll from '../components/RevelationScroll'

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

const confiance = [
  { icon: Shield, titre: 'Contenu conforme', description: 'aux programmes officiels' },
  { icon: Lock, titre: 'Données sécurisées', description: 'et confidentialité garantie' },
  { icon: Award, titre: 'Conçu pour les élèves', description: 'du Bénin' },
  { icon: Headphones, titre: 'Support réactif', description: 'et à ton écoute' },
]

export default function Home() {
  const { user, userType } = useAuth()
  const [monte, setMonte] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMonte(true)
      return
    }
    const raf = requestAnimationFrame(() => setMonte(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <main className="page-accueil">
      <section className="hero">
        <div className="hero-texte">
          <p className={`eyebrow hero-anim ${monte ? 'hero-anim-actif' : ''}`}
             style={{ transitionDelay: '0ms' }}>Système éducatif béninois</p>
          <h1 className={`hero-anim ${monte ? 'hero-anim-actif' : ''}`}
              style={{ transitionDelay: '80ms' }}>Des cours pensés pour ta classe, ta série, et toi.</h1>
          <p className={`sous-titre hero-anim ${monte ? 'hero-anim-actif' : ''}`}
             style={{ transitionDelay: '160ms' }}>
            Évoly personnalise chaque cours selon ton niveau, te connecte à de vrais mentors,
            et suit ta progression matière par matière.
          </p>
          <div className={`hero-actions hero-anim ${monte ? 'hero-anim-actif' : ''}`}
               style={{ transitionDelay: '240ms' }}>
            {user ? (
              <Link
                to={userType === 'mentor' ? '/dashboard/mentor' : '/dashboard/eleve'}
                className="btn btn-primaire"
              >
                Aller à mon tableau de bord
              </Link>
            ) : (
              <>
                <Link to="/inscription/eleve" className="btn btn-primaire btn-cta">Je suis élève</Link>
                <Link to="/inscription/mentor" className="btn btn-secondaire">Je suis mentor</Link>
              </>
            )}
          </div>
        </div>

        <div className={`hero-illustration hero-anim ${monte ? 'hero-anim-actif' : ''}`}
             style={{ transitionDelay: '200ms' }}>
          <img src="/school.png" alt="Élèves béninois en classe" className="hero-image" />
        </div>
      </section>

      <section className="section-fonctionnalites">
        <p className="section-eyebrow">Comment ça marche</p>
        <h2>Une plateforme construite autour de ton parcours scolaire</h2>

        <div className="grille-cartes">
          {fonctionnalites.map((f, i) => (
            <RevelationScroll key={f.titre} delay={i * 100}>
              <div className="carte-fonctionnalite">
                <div className="icone-fonctionnalite">
                  <f.icon size={28} strokeWidth={1.5} />
                </div>
                <h3>{f.titre}</h3>
                <p>{f.description}</p>
                <div className="carte-fonctionnalite-fleche">
                  <ArrowRight size={16} strokeWidth={2} />
                </div>
              </div>
            </RevelationScroll>
          ))}
        </div>
      </section>

      <section className="bande-confiance">
        {confiance.map((c, i) => (
          <RevelationScroll key={c.titre} delay={i * 100}>
            <div className="confiance-item">
              <c.icon size={24} strokeWidth={1.8} />
              <div>
                <p className="confiance-titre">{c.titre}</p>
                <p className="confiance-desc">{c.description}</p>
              </div>
            </div>
          </RevelationScroll>
        ))}
      </section>
    </main>
  )
}
