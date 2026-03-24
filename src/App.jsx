import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Landing Components
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Auth from './components/Auth'

// Core Modules
import OnboardingLayout from './components/onboarding/OnboardingLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'
import ResultsPage from './pages/ResultsPage'
import LoadingScreen from './components/common/LoadingScreen'
import OfflineBanner from './components/common/OfflineBanner'
import { storage } from './utils/storage'

function MainApp() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('signup')
  const [isLoggedIn, setIsLoggedIn] = useState(storage.isLoggedIn())
  const [onboardingComplete, setOnboardingComplete] = useState(storage.isOnboardingComplete())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(storage.isLoggedIn())
    setOnboardingComplete(storage.isOnboardingComplete())
  }, [])

  const toggleAuth = (mode = 'signup') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    setIsLoggedIn(true)
    
    // Sync onboarding state so the router doesn't immediately redirect to /onboarding
    const isComplete = storage.isOnboardingComplete()
    setOnboardingComplete(isComplete)

    if (isComplete) {
      navigate('/dashboard')
    } else {
      navigate('/onboarding')
    }
  }

  const handleLogout = () => {
    storage.clear()
    setIsLoggedIn(false)
    setOnboardingComplete(false)
    navigate('/')
  }

  const handleStartAnalysis = (id = 'new-result') => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      navigate(`/results/${id}`)
    }, 2500)
  }

  return (
    <>
      <AnimatePresence>
        {isAnalyzing && <LoadingScreen />}
      </AnimatePresence>
      
      <OfflineBanner />

      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-bg">
            <Navbar onAuth={toggleAuth} isLoggedIn={isLoggedIn} />
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
        } />

        <Route path="/onboarding" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <OnboardingLayout 
            onComplete={(data) => {
              setOnboardingComplete(true)
              navigate('/dashboard')
            }}
            onLogout={handleLogout}
          />
        } />

        <Route path="/dashboard" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          !onboardingComplete ? <Navigate to="/onboarding" replace /> :
          <DashboardLayout
            onboardingComplete={onboardingComplete}
            onCompleteOnboarding={() => navigate('/onboarding')}
            onLogout={handleLogout}
            onNavigate={(view) => view === 'landing' ? navigate('/') : navigate(`/${view}`)}
            onStartAnalysis={handleStartAnalysis}
          />
        } />

        <Route path="/results/:id" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <ResultsPage onBack={() => navigate('/dashboard')} />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  )
}
