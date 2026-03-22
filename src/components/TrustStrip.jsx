import { motion } from 'framer-motion'
import { ScanSearch, ShieldAlert, UserCheck } from 'lucide-react'

const items = [
  { icon: ScanSearch, label: 'DECODING' },
  { icon: ShieldAlert, label: 'CONFLICTS' },
  { icon: UserCheck, label: 'PERSONALIZED' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function TrustStrip() {
  return (
    <section className="py-10 px-6 lg:px-8 bg-bg relative overflow-hidden">
      {/* Small decorative blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-lavender/10 blur-3xl rounded-full" />
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          {/* Left text */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-text leading-tight">
              No more guessing.
            </h3>
            <p className="text-text-muted text-sm mt-1">
              No more ingredient confusion.
            </p>
          </motion.div>

          {/* Right icons */}
          <motion.div
            className="flex items-center gap-10 md:gap-14"
            variants={containerVariants}
          >
            {items.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <div className="w-10 h-10 rounded-xl bg-bg-warm flex items-center justify-center">
                  <Icon size={18} className="text-text-muted" />
                </div>
                <span className="text-xs font-medium tracking-widest text-text-muted uppercase">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
