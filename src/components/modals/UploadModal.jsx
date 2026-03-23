import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle2, Loader2, Image as ImageIcon, Camera, ArrowRight, Keyboard, Database, ChevronLeft } from 'lucide-react'
import Modal from './Modal'
import { db } from '../../utils/db'
import { storage } from '../../utils/storage'

// --- Mock Ingredient Database ---
const INGREDIENT_DB = {
  'Niacinamide': { role: 'Active', benefit: 'Brightening, pore minimizing', risk: 'low' },
  'Retinol': { role: 'Active', benefit: 'Anti-aging, cell turnover', risk: 'moderate' },
  'Salicylic Acid': { role: 'Active', benefit: 'Exfoliant, acne-fighting', risk: 'moderate' },
  'Glycolic Acid': { role: 'Active', benefit: 'Exfoliant, brightening', risk: 'moderate' },
  'Hyaluronic Acid': { role: 'Hydrator', benefit: 'Deep hydration, plumping', risk: 'low' },
  'Sodium Hyaluronate': { role: 'Hydrator', benefit: 'Deep hydration', risk: 'low' },
  'Ceramide NP': { role: 'Barrier Repair', benefit: 'Strengthens skin barrier', risk: 'low' },
  'Squalane': { role: 'Emollient', benefit: 'Moisturizing, non-comedogenic', risk: 'low' },
  'Glycerin': { role: 'Humectant', benefit: 'Hydration, moisture retention', risk: 'low' },
  'Aqua': { role: 'Base', benefit: 'Solvent', risk: 'low' },
  'Phenoxyethanol': { role: 'Preservative', benefit: 'Product safety', risk: 'low' },
  'Fragrance': { role: 'Additive', benefit: 'Scent', risk: 'high' },
  'Alcohol Denat': { role: 'Solvent', benefit: 'Quick absorption', risk: 'high' },
  'Parfum': { role: 'Additive', benefit: 'Scent', risk: 'high' },
  'Vitamin C': { role: 'Active', benefit: 'Brightening, antioxidant', risk: 'low' },
  'Ascorbic Acid': { role: 'Active', benefit: 'Brightening, antioxidant', risk: 'moderate' },
  'Tocopherol': { role: 'Antioxidant', benefit: 'Skin protection', risk: 'low' },
  'Zinc Oxide': { role: 'Sunscreen', benefit: 'UV protection', risk: 'low' },
  'Titanium Dioxide': { role: 'Sunscreen', benefit: 'UV protection', risk: 'low' },
  'Benzoyl Peroxide': { role: 'Active', benefit: 'Acne-fighting', risk: 'moderate' },
  'Lactic Acid': { role: 'Active', benefit: 'Gentle exfoliant, hydrating', risk: 'moderate' },
  'Cetearyl Alcohol': { role: 'Emollient', benefit: 'Softening, non-irritating', risk: 'low' },
  'Dimethicone': { role: 'Emollient', benefit: 'Smoothing, barrier protection', risk: 'low' },
  'Panthenol': { role: 'Soothing', benefit: 'Calming, healing', risk: 'low' },
  'Allantoin': { role: 'Soothing', benefit: 'Healing, calming', risk: 'low' },
  'Aloe Barbadensis': { role: 'Soothing', benefit: 'Calming, hydrating', risk: 'low' },
  'Sodium Lauryl Sulfate': { role: 'Surfactant', benefit: 'Cleansing', risk: 'high' },
  'Sodium Laureth Sulfate': { role: 'Surfactant', benefit: 'Cleansing', risk: 'moderate' },
}

const CONFLICT_RULES = [
  { pair: ['Retinol', 'Glycolic Acid'], warning: 'Retinol + AHA can cause severe irritation. Avoid using together.' },
  { pair: ['Retinol', 'Salicylic Acid'], warning: 'Retinol + BHA may over-exfoliate and damage the skin barrier.' },
  { pair: ['Retinol', 'Benzoyl Peroxide'], warning: 'Benzoyl Peroxide can deactivate Retinol. Use at different times.' },
  { pair: ['Retinol', 'Vitamin C'], warning: 'Can cause irritation. Use Vitamin C in AM and Retinol in PM.' },
  { pair: ['Vitamin C', 'Niacinamide'], warning: 'May reduce effectiveness if used at high concentrations together.' },
  { pair: ['Glycolic Acid', 'Salicylic Acid'], warning: 'Double acid use risks over-exfoliation.' },
  { pair: ['Benzoyl Peroxide', 'Vitamin C'], warning: 'BP can oxidize Vitamin C, making it ineffective.' },
  { pair: ['Lactic Acid', 'Retinol'], warning: 'Lactic Acid + Retinol can cause irritation and dryness.' },
]

function analyzeIngredients(ingredientsList, userProfile) {
  const parsed = ingredientsList.map(name => {
    const trimmed = name.trim()
    const known = INGREDIENT_DB[trimmed]
    return {
      name: trimmed,
      role: known?.role || 'Unknown',
      benefit: known?.benefit || 'Not in our database yet',
      risk: known?.risk || 'unknown',
      isSafe: known ? known.risk !== 'high' : true
    }
  })

  // Detect conflicts
  const conflicts = []
  const ingredientNames = parsed.map(i => i.name)
  for (const rule of CONFLICT_RULES) {
    const [a, b] = rule.pair
    if (ingredientNames.includes(a) && ingredientNames.includes(b)) {
      conflicts.push({ pair: rule.pair, warning: rule.warning })
    }
  }

  // Personalized warnings based on user sensitivities
  const warnings = []
  const sensitivities = userProfile?.skinProfile?.sensitivities || []
  const skinType = userProfile?.skinProfile?.skinType || ''
  const reactivity = userProfile?.skinProfile?.reactivity || ''

  for (const ing of parsed) {
    if (sensitivities.includes('Fragrance') && (ing.name === 'Fragrance' || ing.name === 'Parfum')) {
      warnings.push({ ingredient: ing.name, message: `You're sensitive to fragrance. This product contains ${ing.name}.`, severity: 'high' })
    }
    if (sensitivities.includes('Alcohol') && (ing.name === 'Alcohol Denat')) {
      warnings.push({ ingredient: ing.name, message: `You're sensitive to alcohol. This product contains drying alcohol.`, severity: 'high' })
    }
    if (sensitivities.includes('Sulfates') && (ing.name === 'Sodium Lauryl Sulfate' || ing.name === 'Sodium Laureth Sulfate')) {
      warnings.push({ ingredient: ing.name, message: `You're sensitive to sulfates. This may strip your skin.`, severity: 'high' })
    }
    if (skinType === 'Oily' && ing.role === 'Emollient' && ing.name === 'Dimethicone') {
      warnings.push({ ingredient: ing.name, message: `Dimethicone may feel heavy on oily skin.`, severity: 'low' })
    }
    if (reactivity === 'Easily irritated' && ing.risk === 'moderate') {
      warnings.push({ ingredient: ing.name, message: `${ing.name} may irritate easily reactive skin. Patch test first.`, severity: 'moderate' })
    }
  }

  // Calculate score
  const highRiskCount = parsed.filter(i => i.risk === 'high').length
  const modRiskCount = parsed.filter(i => i.risk === 'moderate').length
  const totalWarnings = warnings.length
  let score = 100 - (highRiskCount * 20) - (modRiskCount * 8) - (conflicts.length * 10) - (totalWarnings * 3)
  score = Math.max(10, Math.min(100, score))

  let verdict = 'Safe'
  if (score < 50) verdict = 'Avoid'
  else if (score < 70) verdict = 'Use with Caution'
  else if (score < 85) verdict = 'Mostly Safe'

  return { ingredients: parsed, conflicts, warnings, verdict, score }
}

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
    
    const userProfile = storage.getUser()
    const scanId = crypto.randomUUID()
    const resultId = crypto.randomUUID()
    
    const finalProductName = productName || 'Scanned Product'
    const finalIngredients = ingredientsText 
      || 'Aqua, Glycerin, Niacinamide, Squalane, Sodium Hyaluronate, Ceramide NP, Phenoxyethanol'
    
    const ingredientsList = finalIngredients.split(',').map(i => i.trim()).filter(Boolean)
    
    // Run analysis
    const analysis = analyzeIngredients(ingredientsList, userProfile)
    
    const result = {
      id: resultId,
      ...analysis
    }

    const scan = {
      id: scanId,
      productName: finalProductName,
      ingredientsRaw: finalIngredients,
      date: new Date().toISOString(),
      resultId,
      status: analysis.verdict === 'Safe' || analysis.verdict === 'Mostly Safe' ? 'safe' : 
              analysis.verdict === 'Use with Caution' ? 'moderate' : 'danger'
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
                <h3 className="text-xl font-bold">Product Front</h3>
                <p className="text-sm text-text-muted">Upload a photo of the front or type the product name below.</p>
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
                <h3 className="text-xl font-bold">Ingredients List</h3>
                <p className="text-sm text-text-muted">Upload the back image or type/paste the ingredients below.</p>
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
