import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert, Info, Camera, LayoutDashboard, Search } from 'lucide-react'

export function VerdictBadge({ status, score }) {
  const configs = {
    safe: {
      icon: CheckCircle2,
      text: "Safe for your skin",
      color: "bg-green-500",
      bg: "bg-green-50",
      border: "border-green-100",
      textCol: "text-green-700",
      glow: "shadow-[0_0_50px_rgba(34,197,94,0.3)]"
    },
    caution: {
      icon: AlertCircle,
      text: "Use with caution",
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      textCol: "text-yellow-700",
      glow: "shadow-[0_0_50px_rgba(234,179,8,0.3)]"
    },
    danger: {
      icon: XCircle,
      text: "Not recommended",
      color: "bg-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      textCol: "text-red-700",
      glow: "shadow-[0_0_50px_rgba(239,68,68,0.3)]"
    }
  }

  const c = configs[status] || configs.caution

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className={`relative mx-auto flex flex-col items-center p-10 rounded-[3rem] ${c.bg} ${c.border} border-2 ${c.glow} text-center max-w-lg overflow-hidden`}
    >
      {/* Background Animated Glow */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 ${c.color} opacity-10 blur-3xl`}
      />

      <div className={`relative z-10 w-24 h-24 ${c.color} rounded-3xl flex items-center justify-center mb-8 text-white shadow-xl`}>
         <c.icon size={56} strokeWidth={2.5} />
      </div>
      
      <div className="relative z-10 space-y-3">
        <h2 className={`text-4xl font-serif font-black ${c.textCol}`}>
          {c.text}
        </h2>
        <div className="flex flex-col items-center justify-center pt-2">
           <div className="flex items-baseline gap-1">
             <span className="text-5xl font-black text-text">{score}</span>
             <span className="text-xl font-bold text-text-muted">%</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50 mt-1">Safety Score</span>
        </div>
      </div>
    </motion.div>
  )
}

export function IngredientCard({ name, benefit, safe }) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="p-6 bg-white rounded-2xl border border-border/40 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all space-y-4 group"
    >
      <div className="flex items-start justify-between">
         <div className="space-y-1">
            <h4 className="font-bold text-text text-lg group-hover:text-primary transition-colors">{name}</h4>
            <p className="text-xs font-medium text-text-muted leading-relaxed">
              {benefit}
            </p>
         </div>
         <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${safe ? 'bg-green-50 text-green-500' : 'bg-primary/5 text-primary'}`}>
            {safe ? <CheckCircle2 size={18} /> : <Info size={18} />}
         </div>
      </div>
      
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${safe ? 'bg-green-50 text-green-700' : 'bg-primary/5 text-primary'}`}>
         {safe ? '✅ Safe' : '✨ Active'}
      </div>
    </motion.div>
  )
}

export function ConflictCard({ combo, risk, solution }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-5 shadow-sm"
    >
       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 border border-yellow-100/50">
          <ShieldAlert className="text-yellow-500" size={28} />
       </div>
       <div className="space-y-2">
          <h4 className="font-bold text-yellow-900 text-lg leading-tight">{combo}</h4>
          <p className="text-sm font-medium text-yellow-800/80 leading-snug">{risk}</p>
          <div className="inline-block px-3 py-1 bg-white/60 rounded-lg border border-yellow-200/50 text-xs font-bold text-yellow-700 mt-2">
            💡 {solution}
          </div>
       </div>
    </motion.div>
  )
}

export function WarningCard({ type, message }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-5 shadow-sm text-red-900"
    >
       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 border border-red-100/50">
          <AlertCircle className="text-red-500" size={24} />
       </div>
       <div className="space-y-1">
          <h4 className="font-bold text-sm uppercase tracking-widest text-red-700/60">Warning: {type}</h4>
          <p className="text-sm font-bold leading-relaxed">{message}</p>
       </div>
    </motion.div>
  )
}
