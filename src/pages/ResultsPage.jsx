import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Camera, LayoutDashboard, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react'
import { VerdictBadge, IngredientCard, ConflictCard, WarningCard } from '../components/results/ResultComponents'
import { db } from '../utils/db'
import { storage } from '../utils/storage'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [scan, setScan] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const scanData = await db.getScan(id)
      if (scanData) {
        setScan(scanData)
        const resultData = await db.getResult(scanData.resultId)
        
        // Enrich result with personalized warnings
        const user = storage.getUser()
        const enrichedResult = analyzeResult(resultData, user)
        setData(enrichedResult)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const analyzeResult = (result, user) => {
    const warnings = []
    const ingredients = result.ingredients.map(ing => ({
      name: ing,
      benefit: getBenefit(ing),
      safe: isSafe(ing, user)
    }))

    // Check for user-specific sensitivities
    if (user?.skinProfile?.sensitivities) {
      user.skinProfile.sensitivities.forEach(s => {
        if (result.ingredients.some(i => i.toLowerCase().includes(s.toLowerCase().split(' ')[0]))) {
          warnings.push({
            type: s,
            message: `Contains ${s}. You marked this as a sensitivity in your profile.`
          })
        }
      })
    }

    // Simple conflict detection (mock)
    const conflicts = []
    if (result.ingredients.some(i => i.toLowerCase().includes('retinol')) && 
        result.ingredients.some(i => i.toLowerCase().includes('salicylic'))) {
      conflicts.push({
        combo: "Retinol + BHA",
        risk: "Both ingredients are strong exfoliants. Using them together might damage your skin barrier.",
        solution: "Alternate nights between these two."
      })
    }

    return { 
      ...result, 
      ingredients, 
      warnings: [...result.warnings, ...warnings],
      conflicts: [...result.conflicts, ...conflicts]
    }
  }

  const getBenefit = (ing) => {
    const benefits = {
      'Aqua': 'Basis for hydration and product texture',
      'Glycerin': 'Powerful humectant that draws moisture into skin',
      'Niacinamide': 'Brightens and manages sebum production',
      'Squalane': 'Mimics natural oils to prevent moisture loss',
      'Sodium Hyaluronate': 'Form of Hyaluronic acid for deep hydration',
      'Ceramide NP': 'Strengthens and repairs the skin barrier',
      'Retinol': 'Increases cell turnover and boosts collagen',
      'Salicylic Acid': 'Exfoliates deep inside pores',
      'Fragrance': 'Added for sensory experience, may irritate'
    }
    return benefits[ing] || 'Provides structural support and stability to the formula'
  }

  const isSafe = (ing, user) => {
    const sensitiveIngs = ['Fragrance', 'Alcohol', 'Sulfates', 'Parabens']
    if (sensitiveIngs.some(s => ing.includes(s))) {
      return !user?.skinProfile?.sensitivities?.some(us => us.includes(ing))
    }
    return true
  }

  if (loading) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="font-bold text-text-muted">Loading your results...</p>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Scan not found</h2>
      <button onClick={() => navigate('/dashboard')} className="text-primary font-bold underline">Back to Dashboard</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F6F3] pb-24 text-text">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 px-6 md:px-8 h-20 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-text">
              SkinSync
            </Link>
            <div className="h-6 w-px bg-border/40 hidden sm:block" />
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-bg-warm/50 rounded-xl text-sm font-bold text-text-muted hover:text-primary transition-all transition-colors"
            >
              Dashboard
            </button>
         </div>
         
         <button 
           onClick={() => navigate('/dashboard')}
           className="flex items-center gap-2 px-5 py-2.5 bg-bg-warm/50 rounded-2xl text-sm font-bold text-text-muted hover:text-primary transition-all group"
         >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
         </button>
      </nav>

      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto pt-36 px-6 space-y-20"
      >
        {/* HEADER SECTION */}
        <header className="text-center space-y-6">
           <div className="space-y-2">
             <h1 className="font-serif text-4xl md:text-6xl font-black text-text tracking-tight">Analysis Results</h1>
             <p className="text-text-muted font-medium text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
               Here’s how <span className="text-text font-extrabold italic underline decoration-primary/30 underline-offset-4">{scan?.productName}</span> works for your skin.
             </p>
           </div>
        </header>

        {/* SECTION 4 — FINAL VERDICT */}
        <section className="relative py-10">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent blur-3xl rounded-full opacity-20" />
           <VerdictBadge status={data.verdict.toLowerCase()} score={data.score} />
        </section>

        {/* SECTION 3 — PERSONAL WARNINGS */}
        {data.warnings.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center gap-4 px-2">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="font-serif text-2xl font-bold">Warnings for you</h3>
                <div className="h-px bg-border/40 flex-1 ml-2" />
             </div>
             <div className="grid grid-cols-1 gap-4">
                {data.warnings.map((w, i) => <WarningCard key={i} {...w} />)}
             </div>
          </section>
        )}

        {/* SECTION 2 — CONFLICTS */}
        {data.conflicts.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center gap-4 px-2">
                <ShieldAlert className="text-yellow-500" size={24} />
                <h3 className="font-serif text-2xl font-bold">Potential conflicts</h3>
                <div className="h-px bg-border/40 flex-1 ml-2" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.conflicts.map((c, i) => <ConflictCard key={i} {...c} />)}
             </div>
          </section>
        )}

        {/* SECTION 1 — INGREDIENT BREAKDOWN */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-2">
              <Sparkles className="text-primary" size={24} />
              <h3 className="font-serif text-2xl font-bold">Ingredients decoded</h3>
              <div className="h-px bg-border/40 flex-1 ml-2" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.ingredients.map((ing, i) => (
                <IngredientCard key={i} {...ing} />
              ))}
           </div>
        </section>

        {/* FOOTER ACTIONS */}
        <footer className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-border/20">
           <button 
             onClick={() => navigate('/dashboard')}
             className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-[0_15px_35px_rgba(79,125,243,0.3)] hover:bg-black hover:shadow-none translate-y-0 hover:-translate-y-1 transition-all"
           >
              <Camera size={20} />
              Scan another product
           </button>
           <button 
             onClick={() => navigate('/dashboard')}
             className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white border border-border/60 rounded-2xl font-black text-sm text-text-muted hover:text-text hover:bg-bg-warm/30 transition-all shadow-sm"
           >
              <LayoutDashboard size={20} />
              Back to dashboard
           </button>
        </footer>
      </motion.main>
    </div>
  )
}
