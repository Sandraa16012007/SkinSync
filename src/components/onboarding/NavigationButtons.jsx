import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function NavigationButtons({ onBack, onNext, isNextDisabled, isFirstStep, isLastStep }) {
  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/40">
      {!isFirstStep ? (
        <motion.button
          whileHover={{ x: -4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text transition-all px-4 py-2"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>
      ) : <div />}

      <motion.button
        disabled={isNextDisabled}
        whileHover={!isNextDisabled ? { x: 4, scale: 1.05 } : {}}
        whileTap={!isNextDisabled ? { scale: 0.95 } : {}}
        onClick={onNext}
        className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-lg ${
          isNextDisabled 
            ? 'bg-bg-warm text-text-muted/40 cursor-not-allowed shadow-none' 
            : 'bg-primary text-white hover:bg-black shadow-[0_10px_30px_rgba(79,125,243,0.3)]'
        }`}
      >
        {isLastStep ? 'Submit' : 'Next Step'}
        <ArrowRight size={18} />
      </motion.button>
    </div>
  )
}
