import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

/* ─── Mini UI Previews ─── */

function IngredientPreview() {
  return (
    <div className="mt-5 bg-bg rounded-xl p-4 space-y-2.5">
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-text-muted uppercase">
        <span>INCI Name</span>
        <span>Function</span>
      </div>
      {[
        { name: 'Sodium Hyaluronate', tag: 'Hydrator', color: 'bg-primary-light text-primary' },
        { name: 'Tocopherol', tag: 'Antioxidant', color: 'bg-[#E8F5E9] text-success' },
      ].map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <span className="text-xs text-text">{item.name}</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${item.color}`}>
            {item.tag}
          </span>
        </div>
      ))}
    </div>
  )
}

function ConflictPreview() {
  return (
    <div className="mt-5 space-y-3">
      <div className="bg-[#FDE8E8] rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-danger" />
        <span className="text-xs font-medium text-danger">Active Conflict Found</span>
      </div>
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="w-8 h-8 rounded-full bg-accent-lavender/30" />
        <span className="text-text-light text-lg">×</span>
        <div className="w-8 h-8 rounded-full bg-accent-teal/30" />
      </div>
      <div className="flex items-center justify-between text-[10px] text-text-muted px-1">
        <span>Retinol</span>
        <span>AHA/BHA</span>
      </div>
    </div>
  )
}

function PersonalizedPreview() {
  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-muted tracking-wider uppercase">Skin Safety Score</span>
        <span className="text-2xl font-serif font-semibold text-primary">8.4</span>
      </div>
      <div className="space-y-2">
        {['Alcohol-free formula', 'Safe for Sensitive skin'].map((text) => (
          <div key={text} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-text-muted">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Cards Data ─── */

const features = [
  {
    title: 'Ingredient Breakdown',
    description: 'INCI names translated to plain English so you know exactly what goes on your skin.',
    preview: IngredientPreview,
  },
  {
    title: 'Conflict Detection',
    description: 'Stop chemical reactions before they start. We flag ingredients that shouldn\'t mix.',
    preview: ConflictPreview,
  },
  {
    title: 'Personalized Warnings',
    description: 'Safety scores based on your unique skin profile, allergies, and concerns.',
    preview: PersonalizedPreview,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-10 px-6 lg:px-8 bg-bg relative overflow-hidden mt-10">
      {/* Background Blobs */}
      <motion.div 
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-72 h-72 bg-accent-teal/15 blur-[80px] rounded-full" 
      />
      <motion.div 
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-lavender/15 blur-[90px] rounded-full" 
      />
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ title, description, preview: Preview }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-bg-card rounded-2xl p-7 border border-border/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 cursor-default"
            >
              <h4 className="font-serif text-lg font-semibold text-text">{title}</h4>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{description}</p>
              <Preview />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
