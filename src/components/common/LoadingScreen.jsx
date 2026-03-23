import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="font-serif text-3xl font-bold text-text">Analyzing ingredients...</h2>
        <div className="flex flex-col items-center gap-2">
           <p className="text-text-muted font-medium max-w-xs leading-relaxed">
             Comparing formula against 12,000+ known irritants and your personal skin profile.
           </p>
           <div className="w-48 h-1 bg-bg-warm rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full bg-primary"
              />
           </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
