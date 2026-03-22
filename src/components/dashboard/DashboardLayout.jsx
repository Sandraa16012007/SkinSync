import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import HeroScanCard from './HeroScanCard'
import { SafetyScoreCard, DailyRoutineCard } from './RoutineCards'
import ScanHistoryCard from './ScanHistoryCard'
import { SkinFactCard, InsightsCard } from './InsightCards'

const MOCK_DATA = {
  user: "Sandra",
  routineScore: 82,
  scans: [
    { name: "La Roche-Posay Effaclar", date: "2 hours ago", status: "safe" },
    { name: "The Ordinary Niacinamide", date: "Yesterday", status: "safe" },
    { name: "CeraVe Hydrating Cleanser", date: "2 days ago", status: "safe" },
    { name: "Paula's Choice BHA", date: "3 days ago", status: "moderate" }
  ],
  insights: [
    { type: 'info', text: "Your skin may react to fragrance." },
    { type: 'warning', text: "Avoid combining retinol with exfoliating acids." }
  ],
  morningRoutine: ["CeraVe Cleanser", "Vitamin C Serum", "La Roche-Posay SPF 50"],
  nightRoutine: ["Double Cleanse", "Niacinamide", "Retinol 0.5%", "Barrier Cream"]
}

export default function DashboardLayout({ onboardingComplete = false, onCompleteOnboarding, onLogout, onNavigate }) {
  if (!onboardingComplete) {
    return (
       <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
          <DashboardNavbar onLogout={onLogout} onNavigate={onNavigate} />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-md space-y-8"
             >
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <ShieldCheck className="text-primary" size={40} />
                </div>
                
                <div className="space-y-4">
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-text">
                    Hello, Sandra 👋
                  </h1>
                  <p className="text-text-muted text-lg font-medium">
                    Let’s get to know your skin before we begin.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onCompleteOnboarding}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-[0_20px_40px_rgba(79,125,243,0.3)] flex items-center justify-center gap-3 hover:bg-black transition-all"
                >
                  Complete onboarding
                  <ArrowRight size={18} />
                </motion.button>
             </motion.div>
          </div>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] pb-20">
      <DashboardNavbar onLogout={onLogout} onNavigate={onNavigate} />
      
      <main className="max-w-7xl mx-auto pt-32 px-6 md:px-8 space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-serif text-4xl md:text-5xl font-bold text-text"
            >
              Welcome back, Sandra 👋
            </motion.h1>
            <p className="text-text-muted font-medium text-lg">
              Here’s what’s happening with your skin today.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal/10 border border-accent-teal/20 rounded-full"
          >
            <div className="w-2 h-2 bg-accent-teal rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-accent-teal-dark">Your skin profile is active</span>
          </motion.div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
             <HeroScanCard 
               onScan={() => console.log('Scan starting...')}
               onUpload={() => console.log('Upload opening...')}
             />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DailyRoutineCard 
                  morning={MOCK_DATA.morningRoutine}
                  night={MOCK_DATA.nightRoutine}
                />
                <ScanHistoryCard scans={MOCK_DATA.scans} />
             </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
             <SafetyScoreCard score={MOCK_DATA.routineScore} />
             <InsightsCard insights={MOCK_DATA.insights} />
             <SkinFactCard />
          </div>
        </div>
      </main>
    </div>
  )
}
