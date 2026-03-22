import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navbar({ onAuth }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['Analysis', 'Ingredients', 'Routines', 'About']

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="font-serif text-xl font-semibold tracking-tight text-text">
            SkinSync
          </a>

          {/* Center links - desktop */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="relative text-sm text-text-muted hover:text-text transition-colors duration-200 group"
              >
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-text group-hover:w-full transition-all duration-200" />
              </a>
            ))}
          </div>

          {/* Right buttons - desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onAuth('login')}
              className="text-sm text-text-muted hover:text-text transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => onAuth('signup')}
              className="text-sm px-5 py-2 bg-text text-bg rounded-full hover:bg-black transition-all duration-200"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-text-muted hover:text-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg/95 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-sm text-text-muted hover:text-text py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <button 
                  onClick={() => { onAuth('login'); setMobileOpen(false); }}
                  className="text-sm text-text-muted hover:text-text py-2 text-left"
                >
                  Login
                </button>
                <button
                  onClick={() => { onAuth('signup'); setMobileOpen(false); }}
                  className="text-sm px-5 py-2 bg-text text-bg rounded-full text-center hover:bg-black transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
