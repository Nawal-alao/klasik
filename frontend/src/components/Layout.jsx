import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification, ConteneurNotifications } from '../context/NotificationContext'
import EntreePage from './EntreePage'

const HAMBURGER = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

export default function Layout() {
  const { user, userType, loading, logout } = useAuth()
  const { notifications, notifier, retirer } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOuvert, setMenuOuvert] = useState(false)

  useEffect(() => {
    setMenuOuvert(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    notifier("Tu es déconnecté. À bientôt !", 'info')
    navigate('/')
  }

  return (
    <>
      <header className="entete">
        <div className="entete-conteneur">
          <Link to="/" className="logo">Évoly<span>.</span></Link>

          <button
            className="bouton-menu-mobile"
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={String(menuOuvert)}
            onClick={() => setMenuOuvert(prev => !prev)}
          >
            {HAMBURGER}
          </button>

          <nav className={`nav-liens${menuOuvert ? ' ouvert' : ''}`}>
            {!loading && (
              <>
                {user ? (
                  <>
                    {userType === 'eleve' ? (
                      <>
                        <Link to="/dashboard/eleve">Tableau de bord</Link>
                        <Link to="/cours">Cours</Link>
                        <Link to="/examens">Examens</Link>
                        <Link to="/mentors">Mentors</Link>
                        <Link to="/conversations">Messages</Link>
                        <Link to="/communaute">Communauté</Link>
                        <Link to="/abonnement">Abonnement</Link>
                        <Link to="/profil">Mon profil</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/dashboard/mentor">Tableau de bord</Link>
                        <Link to="/cours">Cours</Link>
                        <Link to="/conversations">Messages</Link>
                        <Link to="/communaute">Communauté</Link>
                        <Link to="/profil">Mon profil</Link>
                      </>
                    )}

                    <div className="nav-actions">
                      <button type="button" className="btn btn-secondaire" onClick={handleLogout}>
                        Se déconnecter
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/cours">Cours</Link>
                    <Link to="/mentors">Mentors</Link>

                    <div className="nav-actions">
                      <Link to="/connexion" className="btn btn-secondaire">Se connecter</Link>
                      <Link to="/inscription/eleve" className="btn btn-primaire">Commencer</Link>
                    </div>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <ConteneurNotifications notifications={notifications} onRetirer={retirer} />

      <EntreePage key={location.pathname}>
        <Outlet />
      </EntreePage>

      {!/^\/conversations\/\d+$/.test(location.pathname) && (
        <footer>
          <p>© {new Date().getFullYear()} Évoly — Plateforme éducative béninoise.</p>
        </footer>
      )}
    </>
  )
}
