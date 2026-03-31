import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle2, Loader2, Image as ImageIcon, Camera, ArrowRight, Keyboard, Database, ChevronLeft } from 'lucide-react'
import Modal from './Modal'
import { db } from '../../utils/db'
import { storage } from '../../utils/storage'
import { scanProduct } from '../../services/scanPipeline'

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [step, setStep] = useState('front') // 'front' | 'back' | 'manual' | 'analyzing'
  const [frontImage, setFrontImage] = useState(null)
  const [frontPreview, setFrontPreview] = useState(null)
  const [backImage, setBackImage] = useState(null)
  const [backPreview, setBackPreview] = useState(null)
  const [productName, setProductName] = useState('')
  const [ingredientsText, setIngredientsText] = useState('')

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const preview = URL.createObjectURL(file)
      if (type === 'front') {
        setFrontImage(file)
        setFrontPreview(preview)
      } else {
        setBackImage(file)
        setBackPreview(preview)
      }
    }
  }

  const handleFrontNext = () => {
    if (!productName && !frontImage) return
    setStep('back')
  }

  const handleBackAnalyze = () => {
    if (!ingredientsText && !backImage) return
    handleAnalyze()
  }

  const handleAnalyze = async () => {
    setStep('analyzing')
    
    const userProfile = storage.getUser() || {}
    const scanId = crypto.randomUUID()
    const resultId = crypto.randomUUID()
    
    let analysis;
    try {
      analysis = await scanProduct({
        frontImageFile: frontImage,
        imageFile: backImage,
        ingredientText: ingredientsText,
        profile: userProfile.skinProfile || {}
      });
    } catch(err) {
      console.error('AI Pipeline failed:', err);
      analysis = {
        ingredients: [],
        score: 50,
        safe: [],
        risky: [],
        explanation: 'Analysis could not be completed.'
      }
    }

    const finalProductName = productName || analysis.extractedName || 'Scanned Product'

    let verdict = 'Safe'
    const result = {
      id: resultId,
      ...analysis,
      ingredients: (analysis.ingredients || []).map(ing => ({
        name: ing.name || 'Unknown',
        benefit: ing.benefit || 'Formulation component',
        warning: ing.warning || null,
        risk: ing.risk || 'low',
        safety_status: ing.safety_status || 'Safe',
        isSafe: ing.safety_status ? ing.safety_status === 'Safe' : ing.risk !== 'high'
      })),
      verdict: analysis.verdict,
    }

    const scan = {
      id: scanId,
      productName: finalProductName,
      ingredientsRaw: ingredientsText || 'Image Scanned',
      date: new Date().toISOString(),
      resultId,
      status: (analysis.verdict || 'Safe').toLowerCase().includes('safe') ? 'safe' : 
              (analysis.verdict || '').toLowerCase().includes('caution') ? 'moderate' : 'danger'
    }



    await new Promise(r => setTimeout(r, 1500))

    await db.addResult(result)
    await db.addScan(scan)

    // Close modal first
    reset()
    onClose()

    // Small delay before triggering navigation to avoid state overlaps
    setTimeout(() => {
      onUpload(scanId)
    }, 200)
  }

  const reset = () => {
    setStep('front')
    setFrontImage(null)
    setFrontPreview(null)
    setBackImage(null)
    setBackPreview(null)
    setProductName('')
    setIngredientsText('')
  }

  const getTitle = () => {
    if (step === 'analyzing') return 'Analyzing...'
    if (step === 'manual') return 'Manual Entry'
    if (step === 'back') return 'Step 2 of 2'
    return 'Step 1 of 2'
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose() }} title={getTitle()} size="md">
      <div className="p-8 space-y-6">
        <AnimatePresence mode="wait">
          {/* --- STEP 1: Front Image + Product Name --- */}
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
                <p className="text-sm text-text-muted">First, take a picture of the FRONT of the product. We'll ask for the back next.</p>
              </div>

              {/* Image upload */}
              <label className="relative border-2 border-dashed border-border/40 hover:border-primary rounded-3xl p-8 text-center cursor-pointer transition-all group block">
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'front')} accept="image/*" />
                {frontPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={frontPreview} className="w-24 h-24 object-cover rounded-2xl border border-border/20" alt="Front" />
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Image captured
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-text-muted/40 group-hover:text-primary mb-3" size={28} />
                    <span className="block text-sm font-bold">Upload / Capture Photo</span>
                    <span className="block text-[10px] text-text-muted mt-1">Optional — you can type the name instead</span>
                  </>
                )}
              </label>

              {/* Text input for product name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Product Name</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. CeraVe Hydrating Cleanser"
                  className="w-full px-5 py-4 bg-bg-warm/50 border border-border/10 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep('manual')}
                  className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-primary transition-all flex items-center justify-center gap-2 rounded-2xl border border-border/20 hover:border-primary/30"
                >
                  <Keyboard size={16} /> Enter All Manually
                </button>
                <button 
                  disabled={!productName && !frontImage}
                  onClick={handleFrontNext}
                  className="flex-[1.5] py-4 bg-text text-bg rounded-2xl font-bold text-sm hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* --- STEP 2: Back Image + Ingredients Text --- */}
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
                <h3 className="text-xl font-bold">Step 2: Product Back</h3>
                <p className="text-sm text-text-muted">Now, take a picture of the BACK indicating the ingredients list.</p>
              </div>

              {/* Back image upload */}
              <label className="relative border-2 border-dashed border-border/40 hover:border-accent-teal rounded-3xl p-6 text-center cursor-pointer transition-all group block">
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'back')} accept="image/*" />
                {backPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={backPreview} className="w-24 h-24 object-cover rounded-2xl border border-border/20" alt="Back" />
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Image captured
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-text-muted/40 group-hover:text-accent-teal mb-2" size={24} />
                    <span className="block text-sm font-bold">Upload / Capture Back</span>
                    <span className="block text-[10px] text-text-muted mt-1">Optional — you can type ingredients instead</span>
                  </>
                )}
              </label>

              {/* Text input for ingredients */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Ingredients</label>
                <textarea 
                  rows={4}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Paste or type ingredient list, separated by commas..."
                  className="w-full px-5 py-4 bg-bg-warm/50 border border-border/10 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep('front')}
                  className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-text transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  disabled={!ingredientsText && !backImage}
                  onClick={handleBackAnalyze}
                  className="flex-[2] py-4 bg-text text-bg rounded-2xl font-bold text-sm hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Database size={16} /> Analyze Now
                </button>
              </div>
            </motion.div>
          )}

          {/* --- MANUAL ENTRY (all at once) --- */}
          {step === 'manual' && (
            <motion.div 
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2 mb-2">
                <div className="w-14 h-14 bg-accent-lavender/10 rounded-2xl flex items-center justify-center text-accent-lavender-dark mx-auto mb-3">
                  <Keyboard size={28} />
                </div>
                <h3 className="text-lg font-bold">Manual Entry</h3>
                <p className="text-xs text-text-muted">Type the product name and ingredient list manually.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Product Name</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. CeraVe Hydrating Cleanser"
                  className="w-full px-5 py-4 bg-bg-warm/50 border border-border/10 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Ingredients List</label>
                <textarea 
                  rows={4}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Paste full INCI list, separated by commas..."
                  className="w-full px-5 py-4 bg-bg-warm/50 border border-border/10 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStep('front')}
                  className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-text transition-all"
                >
                  Go Back
                </button>
                <button 
                  disabled={!productName || !ingredientsText}
                  onClick={handleAnalyze}
                  className="flex-[2] py-4 bg-text text-bg rounded-2xl font-bold text-sm hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Analyze Now <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* --- ANALYZING SCREEN --- */}
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
                <p className="text-sm text-text-muted max-w-[240px] mx-auto">
                  Cross-referencing with clinical databases and your skin profile.
                </p>
              </div>
              <div className="w-48 h-1 bg-bg-warm rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}
