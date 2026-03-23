import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Zap, RotateCcw, Sparkles, Loader2 } from 'lucide-react'
import Modal from './Modal'

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasCaptured, setHasCaptured] = useState(false)

  const handleCapture = () => {
    setHasCaptured(true)
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      onCapture({ name: 'New Scanned Product', status: 'safe', date: 'Just now' })
      onClose()
      setHasCaptured(false)
    }, 3000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Product" size="lg">
      <div className="relative aspect-[4/3] bg-black overflow-hidden group">
        {!hasCaptured ? (
          <>
            {/* Mock Camera Feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
               <Camera size={64} className="text-white/10" strokeWidth={1} />
            </div>

            {/* Scan Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
               <div className="relative w-full h-full max-w-sm max-h-80 border-2 border-white/30 rounded-[2rem] overflow-hidden">
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(79,125,243,0.8)]"
                  />
                  
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
               </div>
            </div>

            {/* Hint Text */}
            <div className="absolute bottom-32 inset-x-0 text-center">
               <p className="text-white/80 text-sm font-bold drop-shadow-md">
                 Align the product label within the frame
               </p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-8 space-y-6">
             <div className="relative">
                <Loader2 className="animate-spin text-white" size={64} strokeWidth={1.5} />
                <Sparkles className="absolute -top-2 -right-2 text-accent-teal animate-pulse" size={24} />
             </div>
             <div>
                <h4 className="text-2xl font-serif font-bold mb-2">Analyzing ingredients...</h4>
                <p className="text-white/70 font-medium italic">Decoding complex chemicals into plain English</p>
             </div>
          </div>
        )}

        {/* Camera Controls */}
        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
           <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
              <Zap size={20} />
           </button>
           
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             disabled={isAnalyzing}
             onClick={handleCapture}
             className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isAnalyzing ? 'opacity-50' : 'hover:bg-white group/btn'}`}
           >
              <div className="w-16 h-16 rounded-full bg-white transition-all group-hover/btn:scale-95 group-hover/btn:bg-primary/10" />
           </motion.button>

           <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
              <RotateCcw size={20} />
           </button>
        </div>
      </div>
    </Modal>
  )
}
