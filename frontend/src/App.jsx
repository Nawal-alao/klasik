import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Layout from './components/Layout'
import RouteProtegee from './components/RouteProtegee'

import Home from './pages/Home'
import Connexion from './pages/Connexion'
import InscriptionEleve from './pages/InscriptionEleve'
import InscriptionMentor from './pages/InscriptionMentor'
import DashboardEleve from './pages/DashboardEleve'
import DashboardMentor from './pages/DashboardMentor'
import CoursList from './pages/CoursList'
import CoursDetail from './pages/CoursDetail'
import ExamensList from './pages/ExamensList'
import PasserExamen from './pages/PasserExamen'
import ResultatDetail from './pages/ResultatDetail'
import Mentors from './pages/Mentors'
import Profil from './pages/Profil'
import Abonnement from './pages/Abonnement'
import Communaute from './pages/Communaute'
import GroupeDetail from './pages/GroupeDetail'
import Conversations from './pages/Conversations'
import ConversationDetail from './pages/ConversationDetail'

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription/eleve" element={<InscriptionEleve />} />
            <Route path="/inscription/mentor" element={<InscriptionMentor />} />

            <Route path="/dashboard/eleve" element={<RouteProtegee><DashboardEleve /></RouteProtegee>} />
            <Route path="/dashboard/mentor" element={<RouteProtegee><DashboardMentor /></RouteProtegee>} />
            <Route path="/cours" element={<RouteProtegee><CoursList /></RouteProtegee>} />
            <Route path="/cours/:id" element={<RouteProtegee><CoursDetail /></RouteProtegee>} />
            <Route path="/examens" element={<RouteProtegee><ExamensList /></RouteProtegee>} />
            <Route path="/examens/:id/passer" element={<RouteProtegee><PasserExamen /></RouteProtegee>} />
            <Route path="/resultats/:id" element={<RouteProtegee><ResultatDetail /></RouteProtegee>} />
            <Route path="/mentors" element={<RouteProtegee><Mentors /></RouteProtegee>} />
            <Route path="/profil" element={<RouteProtegee><Profil /></RouteProtegee>} />
            <Route path="/abonnement" element={<RouteProtegee><Abonnement /></RouteProtegee>} />
            <Route path="/communaute" element={<RouteProtegee><Communaute /></RouteProtegee>} />
            <Route path="/communaute/:id" element={<RouteProtegee><GroupeDetail /></RouteProtegee>} />
            <Route path="/conversations" element={<RouteProtegee><Conversations /></RouteProtegee>} />
            <Route path="/conversations/:id" element={<RouteProtegee><ConversationDetail /></RouteProtegee>} />
          </Route>
        </Routes>
      </AuthProvider>
    </NotificationProvider>
  )
}
