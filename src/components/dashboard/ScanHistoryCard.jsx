import { motion } from 'framer-motion'
import { History, ChevronRight, Search, Trash2 } from 'lucide-react'

export default function ScanHistoryCard({ scans = [], onSelect, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-8 border border-white/60 shadow-sm flex flex-col group h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <History className="text-text-muted" size={18} />
          <h3 className="font-serif text-xl font-bold text-text">Recent Scans</h3>
        </div>
        <button className="text-sm font-bold text-primary hover:text-black transition-all">
          View all
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {scans.length > 0 ? scans.map((scan, i) => (
          <div key={scan.id || i} className="group/item relative">
            <button 
              onClick={() => onSelect && onSelect(scan.id)}
              className="w-full flex items-center justify-between p-4 bg-bg-warm/20 rounded-2xl border border-transparent hover:border-border/10 hover:bg-bg-warm/40 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  !scan.status || scan.status === 'safe' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 
                  scan.status === 'moderate' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text mb-0.5 truncate">{scan.productName}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">
                    {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-text-muted/20 group-hover/item:text-primary transition-all shrink-0 mr-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(scan.id);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/item:opacity-100"
            >
               <Trash2 size={16} />
            </button>
          </div>
        )) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-bg-warm rounded-full flex items-center justify-center">
              <Search className="text-text-muted/20" size={32} />
            </div>
            <p className="text-sm font-bold text-text-muted/60">No products scanned yet.</p>
          </div>
        )}
      </div>
      
      {scans.length > 0 && (
         <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-[11px] font-bold text-primary/80 text-center">
               Viewing your {scans.length} most recent scans.
            </p>
         </div>
      )}
    </motion.div>
  )
}
