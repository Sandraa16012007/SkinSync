import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Share2, 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  LayoutDashboard
} from 'lucide-react'
import { db } from '../utils/db'
import { 
  VerdictBadge, 
  IngredientCard, 
  ConflictCard, 
  WarningCard,
  GreenwashingCard
} from '../components/results/ResultComponents'

export default function ResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [scan, setScan] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const scanData = await db.getScan(id) 
        if (scanData) {
          setScan(scanData)
          let resultData = await db.getResult(scanData.resultId)
          if (resultData) {
            // Apply normalization layer
            resultData = normalizeResult(resultData)
            // Add greenwashing check
            const hasGreenwashing = checkGreenwashing(scanData, resultData)
            setData({ ...resultData, greenwashing: hasGreenwashing })
          } 
        }
      } catch (err) {
        console.error("Error fetching scan data:", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const normalizeResult = (aiData) => {
    const safeData = aiData || {}
    const ingredients = (safeData.ingredients || []).map(ing => {
      // Unbox the nested object if corrupted by the old save logic
      const actualIng = (ing.name && typeof ing.name === 'object') ? ing.name : ing;
      return {
        name: actualIng.name || 'Unknown',
        benefit: actualIng.benefit || "Ingredient used in cosmetic formulations.",
        isSafe: actualIng.risk !== "high",
        risk: actualIng.risk || "unknown",
        role: actualIng.role || "Unknown"
      }
    })

    return {
      score: safeData.score || 0,
      verdict: safeData.verdict || "Unknown",
      ingredients,
      warnings: safeData.warnings || [],
      conflicts: safeData.conflicts || [],
      explanation: safeData.explanation || null
    }
  }

  const checkGreenwashing = (scan, result) => {
    if (!scan?.productName || !result?.ingredients) return null;
    const name = scan.productName.toLowerCase()
    const isNaturalClaim = name.includes('natural') || name.includes('organic') || name.includes('pure') || name.includes('clean')
    const hasIrritants = result.ingredients.some(i => i.isSafe === false)
    
    if (isNaturalClaim && hasIrritants) {
      const badIng = result.ingredients.find(i => i.isSafe === false)
      return `This product claims to be 'clean/natural' but contains potential synthetic irritants like ${badIng?.name || 'fragrance'}.`
    }
    return null
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={28} />
      </div>
      <p className="font-serif text-xl font-bold text-text-muted italic">Decoding your skin sync...</p>
    </div>
  )

  if (!data || !scan) return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-center space-y-8 p-6 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-inner">
        <AlertTriangle size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-black text-text">Scan not found</h2>
        <p className="text-text-muted font-medium max-w-xs mx-auto">We couldn't retrieve the analysis for this product.</p>
      </div>
      <button 
        onClick={() => navigate('/dashboard')} 
        className="px-8 py-4 bg-text text-bg rounded-2xl font-black text-sm"
      >
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-text pb-20 overflow-x-hidden">
      {/* HEADER ACTIONS */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/20 px-6 py-4 flex items-center justify-between">
         <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-bg-warm rounded-xl transition-all">
            <ChevronLeft size={24} />
         </button>
         <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Analysis Result</h1>
            <p className="text-sm font-serif font-bold truncate max-w-[180px]">{scan.productName}</p>
         </div>
         <button className="p-2 hover:bg-bg-warm rounded-xl transition-all">
            <Share2 size={24} />
         </button>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-28 px-6 max-w-3xl mx-auto space-y-16"
      >
        {/* SECTION 4 — FINAL VERDICT (MOST IMPORTANT) */}
        <section className="text-center space-y-6">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/60">Final Verdict</h2>
           <VerdictBadge status={data.verdict} score={data.score} />
        </section>

        {/* SECTION 5 — GREENWASHING ALERT (If applicable) */}
        {data.greenwashing && (
          <section>
             <GreenwashingCard message={data.greenwashing} />
          </section>
        )}

        {/* SECTION 3 — PERSONAL WARNINGS */}
        {data.warnings && data.warnings.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center gap-4">
                <h3 className="font-serif text-2xl font-bold">Warnings for you</h3>
                <div className="h-px bg-border/40 flex-1" />
             </div>
             <div className="grid grid-cols-1 gap-4">
                {data.warnings.map((w, i) => (
                  <WarningCard 
                    key={i} 
                    type={w.ingredient || 'Personal'} 
                    message={w.message} 
                  />
                ))}
             </div>
          </section>
        )}

        {/* SECTION 2 — CONFLICTS */}
        {data.conflicts && data.conflicts.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center gap-4">
                <h3 className="font-serif text-2xl font-bold">Potential conflicts</h3>
                <div className="h-px bg-border/40 flex-1" />
             </div>
             <div className="grid grid-cols-1 gap-6">
                {data.conflicts.map((c, i) => (
                  <ConflictCard 
                    key={i} 
                    combo={c.pair.join(' + ')} 
                    risk={c.warning} 
                    solution="Use on alternate nights or consult a professional." 
                  />
                ))}
             </div>
          </section>
        )}

        {/* SECTION 1 — INGREDIENT BREAKDOWN */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <h3 className="font-serif text-2xl font-bold">Ingredients decoded</h3>
              <div className="h-px bg-border/40 flex-1" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.ingredients.map((ing, i) => (
                <IngredientCard 
                  key={i} 
                  name={ing.name} 
                  benefit={ing.benefit} 
                  safe={ing.isSafe} 
                />
              ))}
           </div>
        </section>

        {/* FOOTER ACTIONS */}
        <footer className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-border/20">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all"
            >
               <Camera size={20} />
               Scan another
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white border border-border/60 rounded-2xl font-black text-sm text-text-muted hover:bg-white/50 transition-all"
            >
               <LayoutDashboard size={20} />
               Dashboard
            </button>
         </footer>
      </motion.main>
    </div>
  )
}
