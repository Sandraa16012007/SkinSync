import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Auth from './components/Auth'
import OnboardingLayout from './components/onboarding/OnboardingLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'

export default function App() {
  const [view, setView] = useState('landing') // 'landing', 'onboarding', 'dashboard'
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('skinsync_onboarding')
    if (saved) {
      setOnboardingComplete(true)
    }
  }, [view])

  const toggleAuth = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    setView('dashboard')
  }

  const handleLogout = () => {
    setView('landing')
    localStorage.removeItem('skinsync_onboarding')
    setOnboardingComplete(false)
  }

  if (view === 'onboarding') {
    return (
      <OnboardingLayout 
        onComplete={(data) => {
          console.log('Onboarding complete:', data)
          setOnboardingComplete(true)
          setView('dashboard')
        }}
        onLogout={handleLogout}
      />
    )
  }

  if (view === 'dashboard') {
    return (
      <DashboardLayout
        onboardingComplete={onboardingComplete}
        onCompleteOnboarding={() => setView('onboarding')}
        onLogout={handleLogout}
        onNavigate={setView}
      />
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar onAuth={toggleAuth} />
      <Hero onAuth={() => toggleAuth('signup')} />
      <TrustStrip />
      <Features />
      <CTA onAuth={() => toggleAuth('signup')} />
      <Footer />

      <AnimatePresence>
        {showAuth && (
          <Auth 
            initialMode={authMode} 
            onClose={() => setShowAuth(false)} 
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
