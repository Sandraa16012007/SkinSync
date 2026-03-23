import { useState, useEffect } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { GripVertical, Trash2, Plus, Sunrise, Moon, Sparkles } from 'lucide-react'
import Modal from './Modal'

export default function RoutineModal({ 
  isOpen, 
  onClose, 
  morningProducts = [], 
  nightProducts = [], 
  onUpdateRoutine,
  onOpenAddModal 
}) {
  const [morning, setMorning] = useState(morningProducts)
  const [night, setNight] = useState(nightProducts)

  // Sync state when props change (modal reopens)
  useEffect(() => {
    setMorning(morningProducts)
    setNight(nightProducts)
  }, [morningProducts, nightProducts])

  const handleRemove = (id, section) => {
    if (section === 'Morning') {
      const updated = morning.filter((_, i) => i !== id)
      setMorning(updated)
      onUpdateRoutine(updated, night)
    } else {
      const updated = night.filter((_, i) => i !== id)
      setNight(updated)
      onUpdateRoutine(morning, updated)
    }
  }

  const handleReorder = (newOrder, section) => {
    if (section === 'Morning') {
      setMorning(newOrder)
      onUpdateRoutine(newOrder, night)
    } else {
      setNight(newOrder)
      onUpdateRoutine(morning, newOrder)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Routine" size="lg">
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Morning Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Sunrise className="text-primary" size={20} />
               <h4 className="font-serif text-xl font-bold text-text">Morning</h4>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">{morning.length} Products</span>
          </div>

          <Reorder.Group axis="y" values={morning} onReorder={(vals) => handleReorder(vals, 'Morning')} className="space-y-3">
            {morning.map((product, index) => (
              <Reorder.Item 
                key={product} 
                value={product}
                className="flex items-center gap-4 p-4 bg-bg-warm/30 rounded-2xl border border-border/10 cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md transition-shadow"
              >
                <GripVertical className="text-text-muted/20 group-hover:text-primary transition-all" size={18} />
                <span className="flex-1 text-sm font-bold text-text">{product}</span>
                <button 
                  onClick={() => handleRemove(index, 'Morning')}
                  className="p-2 text-text-muted/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <button 
            onClick={() => onOpenAddModal('Morning')}
            className="w-full py-4 border-2 border-dashed border-border/40 rounded-2xl text-text-muted/60 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2 text-sm font-bold bg-white/50"
          >
             <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Night Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Moon className="text-accent-lavender-dark" size={20} />
               <h4 className="font-serif text-xl font-bold text-text">Night</h4>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">{night.length} Products</span>
          </div>

          <Reorder.Group axis="y" values={night} onReorder={(vals) => handleReorder(vals, 'Night')} className="space-y-3">
            {night.map((product, index) => (
              <Reorder.Item 
                key={product} 
                value={product}
                className="flex items-center gap-4 p-4 bg-bg-warm/30 rounded-2xl border border-border/10 cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md transition-shadow"
              >
                <GripVertical className="text-text-muted/20 group-hover:text-primary transition-all" size={18} />
                <span className="flex-1 text-sm font-bold text-text">{product}</span>
                <button 
                  onClick={() => handleRemove(index, 'Night')}
                  className="p-2 text-text-muted/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <button 
            onClick={() => onOpenAddModal('Night')}
            className="w-full py-4 border-2 border-dashed border-border/40 rounded-2xl text-text-muted/60 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2 text-sm font-bold bg-white/50"
          >
             <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="p-8 bg-primary/5 mt-4 flex items-center justify-center gap-4">
         <Sparkles className="text-primary" size={20} />
         <p className="text-xs font-bold text-primary/80">
           Routine analysis is active. Your safety score will update automatically.
         </p>
      </div>
    </Modal>
  )
}
