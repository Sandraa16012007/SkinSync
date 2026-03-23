import { motion } from 'framer-motion'
import { Plus, Search, Shield } from 'lucide-react'
import Modal from './Modal'

export default function AddProductModal({ isOpen, onClose, scannedProducts = [], onAdd }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Routine" size="md">
      <div className="p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" size={18} />
          <input 
            type="text" 
            placeholder="Search scanned products..." 
            className="w-full pl-12 pr-4 py-4 bg-bg-warm/30 border border-border/10 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary/40 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {scannedProducts.length > 0 ? scannedProducts.map((product, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border/10 group hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-bg-warm rounded-xl flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Shield size={18} />
                 </div>
                 <div>
                    <h5 className="text-sm font-bold text-text">{product.productName}</h5>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className={`w-2 h-2 rounded-full ${(!product.status || product.status === 'safe') ? 'bg-green-400' : 'bg-yellow-400'}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">{product.status || 'safe'}</span>
                    </div>
                 </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAdd(product)}
                className="p-3 bg-bg-warm/50 text-text-muted hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
              >
                 <Plus size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
          )) : (
            <div className="text-center py-12 space-y-4 opacity-40">
               <Search className="mx-auto" size={48} strokeWidth={1} />
               <p className="text-sm font-bold">No products scanned yet</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/10">
           <button className="w-full py-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-center gap-2">
              <Plus size={18} />
              Scan a new product
           </button>
        </div>
      </div>
    </Modal>
  )
}
