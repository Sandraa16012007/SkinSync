import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTA({ onAuth }) {
  return (
    <section className="relative py-14 px-6 lg:px-8 bg-bg-warm overflow-hidden mt-15 mb-20">
      {/* Subtle top border curve */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-bg" style={{ borderRadius: '0 0 50% 50%' }} />

      <motion.div
        className="relative max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h2 className="font-serif text-3xl md:text-[2.6rem] font-semibold text-text leading-tight">
          Stop guessing your skincare.
        </h2>
        <p className="text-text-muted mt-4 text-base md:text-lg leading-relaxed max-w-md mx-auto">
          Join thousands of users who trust SkinSync to curate their daily routine with clinical precision.
        </p>

        {/* CTA Button with glow */}
        <div className="mt-10 relative inline-block">
          {/* Animated glow */}
          <motion.div
            className="absolute -inset-3 rounded-full bg-primary/20 blur-xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.button
            onClick={onAuth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative inline-block px-10 py-4 bg-primary text-white text-sm font-bold rounded-full shadow-[0_4px_20px_rgba(79,125,243,0.3)] hover:shadow-[0_6px_28px_rgba(79,125,243,0.4)] transition-all duration-300"
          >
            Scan your first product
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
