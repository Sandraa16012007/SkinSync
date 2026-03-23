import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, X } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => {
      setIsOffline(true)
      setIsVisible(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
        >
          <div className="bg-text text-bg p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <WifiOff size={18} />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">You’re offline</p>
                <p className="text-[10px] text-bg/60 font-medium">Showing saved data from local storage.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
