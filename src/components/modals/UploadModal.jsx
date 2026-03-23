import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle2, Loader2, Image as ImageIcon, Camera, ArrowRight, Keyboard, Database } from 'lucide-react'
import Modal from './Modal'
import { db } from '../../utils/db'

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [step, setStep] = useState('front') // 'front' | 'back' | 'manual' | 'analyzing'
  const [frontImage, setFrontImage] = useState(null)
  const [backImage, setBackImage] = useState(null)
  const [manualData, setManualData] = useState({ productName: '', ingredients: '' })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (type === 'front') {
        setFrontImage(file)
        setStep('back')
      } else {
        setBackImage(file)
        handleAnalyze()
      }
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setStep('analyzing')
    
    // Mock Analysis Logic
    setTimeout(async () => {
      const id = crypto.randomUUID()
      const resultId = crypto.randomUUID()
      
      const productName = manualData.productName || (frontImage ? "Scanned Product" : "Unknown Product")
      const ingredients = manualData.ingredients || "Aqua, Glycerin, Niacinamide, Squalane, Sodium Hyaluronate, Ceramide NP, Phenoxyethanol"
      
      const result = {
        id: resultId,
        ingredients: ingredients.split(',').map(i => i.trim()),
        conflicts: [], // Logic to be implemented in ResultsPage
        warnings: [],
        verdict: 'Safe',
        score: 85
      }

      const scan = {
        id,
        productName,
        frontImage: frontImage ? URL.createObjectURL(frontImage) : null,
        backImage: backImage ? URL.createObjectURL(backImage) : null,
        date: new Date().toISOString(),
        resultId
      }

      await db.addResult(result)
      await db.addScan(scan)
      await db.incrementScanCount()

      setIsAnalyzing(false)
      onUpload(id) // Pass the scan ID to navigate
      reset()
      onClose()
    }, 3000)
  }

  const reset = () => {
    setStep('front')
    setFrontImage(null)
    setBackImage(null)
    setManualData({ productName: '', ingredients: '' })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 'analyzing' ? 'Analyzing' : 'New Scan'} size="md">
      <div className="p-8 space-y-6">
        <AnimatePresence mode="wait">
          {step === 'front' && (
            <motion.div 
              key="front"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                  <Camera size={32} />
                </div>
                <h3 className="text-xl font-bold">Step 1: Product Front</h3>
                <p className="text-sm text-text-muted">Take a photo of the front to detect the product name.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="relative border-2 border-dashed border-border/40 hover:border-primary rounded-3xl p-10 text-center cursor-pointer transition-all group">
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'front')} accept="image/*" />
                  <Upload className="mx-auto text-text-muted/40 group-hover:text-primary mb-3" size={32} />
                  <span className="block text-sm font-bold">Upload / Capture</span>
                </label>
                
                <button 
                  onClick={() => setStep('manual')}
                  className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-text-muted hover:text-text transition-all"
                >
                  <Keyboard size={18} />
                  Input Manually Instead
                </button>
              </div>
            </motion.div>
          )}

          {step === 'back' && (
            <motion.div 
              key="back"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="relative w-16 h-16 bg-accent-teal/10 rounded-2xl flex items-center justify-center text-accent-teal mx-auto mb-4">
                  <FileText size={32} />
                  <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                </div>
                <h3 className="text-xl font-bold">Step 2: Ingredients List</h3>
                <p className="text-sm text-text-muted">Now snap the back image with the ingredients list.</p>
              </div>

              <label className="relative border-2 border-dashed border-border/40 hover:border-accent-teal rounded-3xl p-10 text-center cursor-pointer transition-all group">
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'back')} accept="image/*" />
                <Upload className="mx-auto text-text-muted/40 group-hover:text-accent-teal mb-3" size={32} />
                <span className="block text-sm font-bold">Upload / Capture Back</span>
              </label>
            </motion.div>
          )}

          {step === 'manual' && (
            <motion.div 
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Product Name</label>
                <input 
                  type="text" 
                  value={manualData.productName}
                  onChange={(e) => setManualData({...manualData, productName: e.target.value})}
                  placeholder="e.g. CeraVe Hydrating Cleanser"
                  className="w-full px-5 py-4 bg-bg-warm/50 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Ingredients List</label>
                <textarea 
                  rows={4}
                  value={manualData.ingredients}
                  onChange={(e) => setManualData({...manualData, ingredients: e.target.value})}
                  placeholder="Paste ingredients here..."
                  className="w-full px-5 py-4 bg-bg-warm/50 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep('front')}
                  className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-text"
                >
                  Go Back
                </button>
                <button 
                  disabled={!manualData.productName || !manualData.ingredients}
                  onClick={handleAnalyze}
                  className="flex-[2] py-4 bg-text text-bg rounded-2xl font-bold text-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Analyze Now
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Analyzing Ingredients...</h3>
                <p className="text-sm text-text-muted max-w-[200px] mx-auto">
                  Cross-referencing with clinical databases and your skin profile.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}
