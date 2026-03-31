import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ShieldCheck, AlertCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react'
import Modal from './Modal'

export default function RoutineSummaryModal({ isOpen, onClose, analysis }) {
  if (!analysis) return null;

  const getStatusColor = () => {
    const score = analysis.score || 0
    if (score >= 85) return 'text-primary bg-primary/10'
    if (score >= 65) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getIcon = () => {
    const score = analysis.score || 0
    if (score >= 85) return <ShieldCheck size={24} />
    if (score >= 65) return <Info size={24} />
    return <AlertCircle size={24} />
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Routine Analysis" size="lg">
      <div className="p-8 space-y-8">
        {/* Score Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-bg-warm/30 border border-border/10">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="transparent"
                stroke="#EAE8E0"
                strokeWidth="10"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 58}
                initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 58) * (1 - (analysis.score || 0) / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={getStatusColor().split(' ')[0]}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
               <span className="text-3xl font-serif font-black text-text">{analysis.score}%</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
             <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor()}`}>
                   {getIcon()}
                   {analysis.verdict}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">
                   SkinProfile: {analysis.profileMatch || 'Matched'}
                </div>
             </div>
             <h3 className="text-3xl font-serif font-bold text-text leading-tight">Dermatologist Verdict</h3>
             <p className="text-base text-text-muted leading-relaxed font-medium">
               "{analysis.explanation}"
             </p>
          </div>
        </div>

        {/* Actionable Tips */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              <h4 className="text-sm font-black uppercase tracking-widest text-text">Dermatologist Tips</h4>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {analysis.tips?.map((tip, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-border/10 shadow-sm group hover:border-primary/20 transition-all"
                 >
                    <div className="mt-0.5 p-1.5 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                       <CheckCircle2 size={14} />
                    </div>
                    <p className="text-sm font-medium text-text-muted leading-relaxed">
                      {tip}
                    </p>
                 </motion.div>
              ))}
           </div>
        </div>

        <div className="p-6 bg-primary/5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all border border-primary/10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <p className="text-sm font-bold text-text">Clinical Verification</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Verified for your skin profile</p>
              </div>
           </div>
           <ChevronRight size={20} className="text-text-muted/40 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Modal>
  )
}
