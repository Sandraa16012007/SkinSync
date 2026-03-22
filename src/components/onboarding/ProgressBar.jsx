import { motion } from 'framer-motion'

export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-md mx-auto mb-10 text-center">
      <div className="flex justify-between items-end mb-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/60">Step {currentStep} of {totalSteps}</span>
        <span className="text-xl font-serif font-bold text-primary">{Math.round(progress)}%</span>
      </div>
      <div className="h-2.5 w-full bg-bg-warm rounded-full overflow-hidden shadow-inner p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(79,125,243,0.4)] relative overflow-hidden"
        >
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  )
}
