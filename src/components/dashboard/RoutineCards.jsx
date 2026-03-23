import { motion } from 'framer-motion'
import { ShieldCheck, AlertCircle, Sunrise, Moon, Plus, Edit3 } from 'lucide-react'

export function SafetyScoreCard({ score = 82, status = "Safe" }) {
  const getStatusColor = () => {
    if (score >= 80) return 'text-primary'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-8 border border-white/60 shadow-sm flex flex-col items-center justify-center text-center group"
    >
      <header className="w-full mb-6">
        <h3 className="font-serif text-xl font-bold text-text">Routine Safety</h3>
      </header>
      
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="40"
            fill="transparent"
            stroke="#F0EFEA"
            strokeWidth="10"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={getStatusColor()}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
           <span className="text-4xl font-serif font-black text-text">{score}%</span>
           <span className={`text-xs font-black uppercase tracking-widest ${getStatusColor()}`}>{status}</span>
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3 text-left">
           <AlertCircle className="text-orange-500 shrink-0" size={18} />
           <p className="text-[12px] font-bold text-orange-900 leading-snug">
              Retinol + AHA detected in your night routine. May cause irritation.
           </p>
        </div>
        
        <button className="w-full py-3 text-sm font-bold text-text-muted hover:text-primary transition-all flex items-center justify-center gap-2">
           View full routine summary
        </button>
      </div>
    </motion.div>
  )
}

export function DailyRoutineCard({ morning = [], night = [], onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-8 border border-white/60 shadow-sm space-y-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold text-text">Your Routine</h3>
        <button 
          onClick={onEdit}
          className="p-2 bg-bg-warm/50 text-text-muted hover:text-primary rounded-xl transition-all"
        >
           <Edit3 size={18} />
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sunrise className="text-primary" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-text-muted">Morning</span>
          </div>
          <div className="space-y-3">
             {morning.length > 0 ? morning.map((product, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-bg-warm/30 rounded-2xl border border-border/10">
                   <span className="text-sm font-bold text-text">{product}</span>
                   <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted/60">AM</span>
                </div>
             )) : (
                <button className="w-full py-4 border-2 border-dashed border-border/40 rounded-2xl text-text-muted/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                   <Plus size={16} /> Add Product
                </button>
             )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="text-accent-lavender" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-text-muted">Night</span>
          </div>
          <div className="space-y-3">
             {night.length > 0 ? night.map((product, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-bg-warm/30 rounded-2xl border border-border/10">
                   <span className="text-sm font-bold text-text">{product}</span>
                   <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted/60">PM</span>
                </div>
             )) : (
                <button className="w-full py-4 border-2 border-dashed border-border/40 rounded-2xl text-text-muted/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                   <Plus size={16} /> Add Product
                </button>
             )}
          </div>
        </section>
      </div>
    </motion.div>
  )
}
