import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, RotateCcw, Sparkles, ChevronLeft, ArrowRight, Database } from 'lucide-react'
import { db } from '../../utils/db'
import { storage } from '../../utils/storage'

// --- Analysis Engine ---
const INGREDIENT_DB = {
  'Niacinamide': { role: 'Active', benefit: 'Brightening, pore minimizing', risk: 'low' },
  'Retinol': { role: 'Active', benefit: 'Anti-aging, cell turnover', risk: 'moderate' },
  'Salicylic Acid': { role: 'Active', benefit: 'Exfoliant, acne-fighting', risk: 'moderate' },
  'Glycolic Acid': { role: 'Active', benefit: 'Exfoliant, brightening', risk: 'moderate' },
  'Hyaluronic Acid': { role: 'Hydrator', benefit: 'Deep hydration, plumping', risk: 'low' },
  'Sodium Hyaluronate': { role: 'Hydrator', benefit: 'Deep hydration', risk: 'low' },
  'Ceramide NP': { role: 'Barrier Repair', benefit: 'Strengthens skin barrier', risk: 'low' },
  'Squalane': { role: 'Emollient', benefit: 'Moisturizing', risk: 'low' },
  'Glycerin': { role: 'Humectant', benefit: 'Hydration', risk: 'low' },
  'Aqua': { role: 'Base', benefit: 'Solvent', risk: 'low' },
  'Phenoxyethanol': { role: 'Preservative', benefit: 'Product safety', risk: 'low' },
  'Fragrance': { role: 'Additive', benefit: 'Scent', risk: 'high' },
  'Alcohol Denat': { role: 'Solvent', benefit: 'Quick absorption', risk: 'high' },
  'Parfum': { role: 'Additive', benefit: 'Scent', risk: 'high' },
  'Vitamin C': { role: 'Active', benefit: 'Brightening', risk: 'low' },
  'Benzoyl Peroxide': { role: 'Active', benefit: 'Acne-fighting', risk: 'moderate' },
  'Lactic Acid': { role: 'Active', benefit: 'Gentle exfoliant', risk: 'moderate' },
  'Dimethicone': { role: 'Emollient', benefit: 'Smoothing', risk: 'low' },
  'Panthenol': { role: 'Soothing', benefit: 'Calming', risk: 'low' },
  'Sodium Lauryl Sulfate': { role: 'Surfactant', benefit: 'Cleansing', risk: 'high' },
}

const CONFLICT_RULES = [
  { pair: ['Retinol', 'Glycolic Acid'], warning: 'Retinol + AHA can cause severe irritation.' },
  { pair: ['Retinol', 'Salicylic Acid'], warning: 'Retinol + BHA may over-exfoliate.' },
  { pair: ['Retinol', 'Benzoyl Peroxide'], warning: 'BP can deactivate Retinol.' },
  { pair: ['Retinol', 'Vitamin C'], warning: 'Can cause irritation.' },
  { pair: ['Glycolic Acid', 'Salicylic Acid'], warning: 'Double acid use risks over-exfoliation.' },
]

function analyzeIngredients(ingredientsList, userProfile) {
  const parsed = ingredientsList.map(name => {
    const trimmed = name.trim()
    const known = INGREDIENT_DB[trimmed]
    return {
      name: trimmed,
      role: known?.role || 'Unknown',
      benefit: known?.benefit || 'Not in database',
      risk: known?.risk || 'unknown',
      isSafe: known ? known.risk !== 'high' : true
    }
  })

  const conflicts = []
  const names = parsed.map(i => i.name)
  for (const rule of CONFLICT_RULES) {
    if (names.includes(rule.pair[0]) && names.includes(rule.pair[1]))
      conflicts.push({ pair: rule.pair, warning: rule.warning })
  }

  const warnings = []
  const sensitivities = userProfile?.skinProfile?.sensitivities || []
  const reactivity = userProfile?.skinProfile?.reactivity || ''
  for (const ing of parsed) {
    if (sensitivities.includes('Fragrance') && (ing.name === 'Fragrance' || ing.name === 'Parfum'))
      warnings.push({ ingredient: ing.name, message: `You're sensitive to fragrance.`, severity: 'high' })
    if (sensitivities.includes('Alcohol') && ing.name === 'Alcohol Denat')
      warnings.push({ ingredient: ing.name, message: `Contains drying alcohol.`, severity: 'high' })
    if (reactivity === 'Easily irritated' && ing.risk === 'moderate')
      warnings.push({ ingredient: ing.name, message: `${ing.name} may irritate reactive skin.`, severity: 'moderate' })
  }

  const highRisk = parsed.filter(i => i.risk === 'high').length
  const modRisk = parsed.filter(i => i.risk === 'moderate').length
  let score = 100 - (highRisk * 20) - (modRisk * 8) - (conflicts.length * 10) - (warnings.length * 3)
  score = Math.max(10, Math.min(100, score))

  let verdict = 'Safe'
  if (score < 50) verdict = 'Avoid'
  else if (score < 70) verdict = 'Use with Caution'
  else if (score < 85) verdict = 'Mostly Safe'

  return { ingredients: parsed, conflicts, warnings, verdict, score }
}

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [step, setStep] = useState('front')
  const [frontCaptured, setFrontCaptured] = useState(null)
  const [backCaptured, setBackCaptured] = useState(null)
  const [productName, setProductName] = useState('')
  const [ingredientsText, setIngredientsText] = useState('')
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (streamRef.current) return // Already running
    
    setCameraError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(e => console.error("Video play failed", e))
      }
    } catch (err) {
      console.warn('Camera failed:', err)
      setCameraError(true)
    }
  }, [])

  useEffect(() => {
    if (isOpen && (step === 'front' || step === 'back')) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [isOpen, step, startCamera, stopCamera])

  const capturePhoto = () => {
    if (!videoRef.current) return null
    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.8)
    } catch (e) {
      console.error("Capture failed", e)
      return null
    }
  }

  const handleCapture = () => {
    const photo = capturePhoto()
    if (photo) {
      if (step === 'front') setFrontCaptured(photo)
      else setBackCaptured(photo)
    }
  }

  const handleRetake = () => {
    if (step === 'front') setFrontCaptured(null)
    else setBackCaptured(null)
  }

  const handleFrontNext = () => {
    if (!productName && !frontCaptured) return
    setStep('back')
  }

  const runAnalysis = async () => {
    setStep('analyzing')
    stopCamera()

    const userProfile = storage.getUser()
    const scanId = crypto.randomUUID()
    const resultId = crypto.randomUUID()

    const finalProductName = productName || 'Scanned Product'
    const finalIngredients = ingredientsText
      || 'Aqua, Glycerin, Niacinamide, Squalane, Sodium Hyaluronate, Ceramide NP, Phenoxyethanol'

    const ingredientsList = finalIngredients.split(',').map(i => i.trim()).filter(Boolean)
    const analysis = analyzeIngredients(ingredientsList, userProfile)

    const result = { id: resultId, ...analysis }
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

    // Reset and close
    handleCloseInternal()
    
    // Trigger callback
    setTimeout(() => {
      onCapture(scanId)
    }, 200)
  }

  const handleCloseInternal = (shouldCallOnClose = true) => {
    stopCamera()
    setStep('front')
    setFrontCaptured(null)
    setBackCaptured(null)
    setProductName('')
    setIngredientsText('')
    if (shouldCallOnClose) onClose()
  }

  if (!isOpen) return null

  const isFront = step === 'front'
  const isBack = step === 'back'
  const isCamera = isFront || isBack
  const captured = isFront ? frontCaptured : backCaptured

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => handleCloseInternal()}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between shrink-0">
          <h3 className="font-serif text-lg font-bold text-text">
            {step === 'analyzing' ? 'Analyzing...' : isFront ? 'Step 1: Product Front' : 'Step 2: Ingredients'}
          </h3>
          <button onClick={() => handleCloseInternal()} className="p-2 bg-bg-warm/50 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isCamera && (
            <div>
              {/* Camera Viewfinder */}
              <div className="relative bg-gray-950 overflow-hidden" style={{ height: '260px' }}>
                {/* Video element - always rendered if camera is on */}
                <video
                  ref={(el) => {
                    videoRef.current = el
                    if (el && streamRef.current && !el.srcObject) {
                      el.srcObject = streamRef.current
                      el.play().catch(() => {})
                    }
                  }}
                  className={`w-full h-full object-cover ${(captured || cameraError) ? 'hidden' : 'block'}`}
                  autoPlay
                  playsInline
                  muted
                />

                {/* Error screen */}
                {!captured && cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Camera size={48} className="text-white/15" strokeWidth={1} />
                    <p className="text-white/40 text-xs font-medium px-8 text-center">
                      Permission required or camera unavailable.
                    </p>
                  </div>
                )}

                {/* Captured preview overlay */}
                {captured && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                    <img src={captured} className="max-h-full max-w-full object-contain" alt="Captured" />
                  </div>
                )}

                {/* UI Overlays */}
                {!captured && !cameraError && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10">
                      <div className="relative w-full max-w-[260px] h-[160px] border-2 border-white/20 rounded-2xl">
                        <motion.div
                          animate={{ y: ['0%', '100%', '0%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                      <button
                        onClick={handleCapture}
                        className="w-14 h-14 rounded-full border-[3px] border-white flex items-center justify-center bg-transparent"
                      >
                        <div className="w-10 h-10 rounded-full bg-white" />
                      </button>
                    </div>
                  </>
                )}

                {/* Step label */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] font-bold text-white/70 tracking-widest uppercase">
                  {isFront ? 'FRONT' : 'BACK'}
                </div>

                {/* Retake */}
                {captured && (
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center">
                    <button onClick={handleRetake} className="flex items-center gap-1.5 px-4 py-1.5 bg-black/50 backdrop-blur text-white/80 text-xs font-bold rounded-full">
                      <RotateCcw size={14} /> Retake
                    </button>
                  </div>
                )}
              </div>

              {/* Form entries */}
              <div className="p-5 space-y-4">
                {isFront ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Product Name</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. CeraVe Cleanser"
                        className="w-full px-4 py-3 bg-bg-warm/50 border border-border/10 rounded-xl outline-none focus:ring-2 ring-primary/20 font-medium text-sm"
                      />
                    </div>
                    <button
                      disabled={!productName && !frontCaptured}
                      onClick={handleFrontNext}
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm"
                    >
                      Next Step
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Ingredients List</label>
                      <textarea
                        rows={3}
                        value={ingredientsText}
                        onChange={(e) => setIngredientsText(e.target.value)}
                        placeholder="Aqua, Glycerin..."
                        className="w-full px-4 py-3 bg-bg-warm/50 border border-border/10 rounded-xl outline-none focus:ring-2 ring-primary/20 font-medium text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep('front')} className="flex-1 py-4 border border-border/20 rounded-xl font-bold text-sm text-text-muted">Back</button>
                      <button
                        disabled={!ingredientsText && !backCaptured}
                        onClick={runAnalysis}
                        className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold text-sm"
                      >
                        Start Analysis
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-20 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div>
                <h3 className="text-xl font-serif font-bold">Matching with skin profile...</h3>
                <p className="text-sm text-text-muted">Clinical databases are being synced.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
