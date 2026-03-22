import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Auth from './components/Auth'

export default function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const toggleAuth = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuth(true)
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
          />
        )}
      </AnimatePresence>
    </div>
  )
}
