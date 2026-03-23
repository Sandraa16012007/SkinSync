import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert, Info, AlertTriangle, Sparkles } from 'lucide-react'

export function VerdictBadge({ status, score }) {
  const configs = {
    safe: {
      icon: CheckCircle2,
      text: "Safe for your skin",
      color: "bg-green-500",
      bg: "bg-green-50",
      border: "border-green-200",
      textCol: "text-green-800",
      glow: "shadow-[0_0_60px_rgba(34,197,94,0.4)]"
    },
    caution: {
      icon: AlertCircle,
      text: "Use with caution",
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      textCol: "text-yellow-800",
      glow: "shadow-[0_0_60px_rgba(234,179,8,0.4)]"
    },
    danger: {
      icon: XCircle,
      text: "Not recommended",
      color: "bg-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      textCol: "text-red-800",
      glow: "shadow-[0_0_60px_rgba(239,68,68,0.4)]"
    }
  }

  const getStatus = () => {
    const s = status?.toLowerCase() || ''
    if (s.includes('safe')) return 'safe'
    if (s.includes('caution')) return 'caution'
    if (s.includes('avoid')) return 'danger'
    if (s.includes('danger')) return 'danger'
    return 'caution'
  }

  const c = configs[getStatus()]

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative mx-auto flex flex-col items-center p-12 rounded-[4rem] ${c.bg} ${c.border} border-4 ${c.glow} text-center max-w-xl`}
    >
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute inset-0 ${c.color} opacity-10 blur-3xl`}
      />

      <div className={`relative z-10 w-28 h-28 ${c.color} rounded-[2rem] flex items-center justify-center mb-10 text-white shadow-2xl`}>
         <c.icon size={64} strokeWidth={2.5} />
      </div>
      
      <div className="relative z-10 space-y-4">
        <h2 className={`text-5xl font-serif font-black ${c.textCol} tracking-tight`}>
          {c.text}
        </h2>
        <div className="flex flex-col items-center pt-4">
           <div className="bg-white/60 backdrop-blur-sm px-8 py-3 rounded-2xl border border-white/40 shadow-sm">
             <span className="text-4xl font-black text-text">{score}</span>
             <span className="text-xl font-bold text-text-muted ml-1">%</span>
             <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 mt-1">Safety Score</span>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

export function IngredientCard({ name, benefit, safe }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="p-6 bg-white rounded-3xl border border-border/40 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col"
    >
      <div className="flex-1 space-y-2">
         <h4 className="font-bold text-text text-lg">{name}</h4>
         <p className="text-sm font-medium text-text-muted leading-relaxed">
           {benefit}
         </p>
      </div>
      
      <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider ${safe ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>
         {safe ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
         {safe ? 'SAFE FOR YOUR SKIN' : 'ACTIVE INGREDIENT'}
      </div>
    </motion.div>
  )
}

export function ConflictCard({ combo, risk, solution }) {
  return (
    <motion.div 
      className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100 flex items-start gap-6 shadow-sm"
    >
       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 border border-orange-100">
          <ShieldAlert className="text-orange-500" size={32} />
       </div>
       <div className="space-y-2">
          <h4 className="font-bold text-orange-950 text-xl tracking-tight">{combo}</h4>
          <p className="text-base font-medium text-orange-900/70">{risk}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-xl border border-orange-200 text-xs font-bold text-orange-800 mt-2">
            <Info size={14} /> {solution}
          </div>
       </div>
    </motion.div>
  )
}

export function WarningCard({ type, message }) {
  return (
    <motion.div 
      className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100 flex items-start gap-6 shadow-sm"
    >
       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 border border-red-100">
          <AlertCircle className="text-red-500" size={28} />
       </div>
       <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-red-700/60 mb-1">Personal Warning</h4>
          <p className="text-lg font-bold text-red-950 leading-tight">Contains {type}</p>
          <p className="text-sm font-medium text-red-900/70 italic">"{message}"</p>
       </div>
    </motion.div>
  )
}

export function GreenwashingCard({ message }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-center gap-4 opacity-80"
    >
       <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400">
          <AlertTriangle size={20} />
       </div>
       <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Marketing Alert</h4>
          <p className="text-sm font-bold text-slate-600 tracking-tight">{message}</p>
       </div>
    </motion.div>
  )
}
