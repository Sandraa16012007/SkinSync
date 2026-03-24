import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import HeroScanCard from './HeroScanCard'
import { SafetyScoreCard, DailyRoutineCard } from './RoutineCards'
import ScanHistoryCard from './ScanHistoryCard'
import { SkinFactCard, InsightsCard } from './InsightCards'

// Modals
import SettingsModal from '../modals/SettingsModal'
import CameraModal from '../modals/CameraModal'
import UploadModal from '../modals/UploadModal'
import RoutineModal from '../modals/RoutineModal'
import AddProductModal from '../modals/AddProductModal'

import { db } from '../../utils/db'
import { storage } from '../../utils/storage'

export default function DashboardLayout({ onboardingComplete = false, onCompleteOnboarding, onLogout, onNavigate, onStartAnalysis }) {
  const [activeModals, setActiveModals] = useState({
    settings: false,
    camera: false,
    upload: false,
    routine: false,
    addProduct: false
  })
  
  const [morning, setMorning] = useState([])
  const [night, setNight] = useState([])
  const [scans, setScans] = useState([])
  const [stats, setStats] = useState({ totalScans: 0, weeklyScans: 0 })
  const [userProfile, setUserProfile] = useState(storage.getUser())
  const [addSection, setAddSection] = useState('Morning')

  useEffect(() => {
    const loadDashboardData = async () => {
      setUserProfile(storage.getUser())
      const recentScans = await db.getAllScans()
      setScans(recentScans.slice(0, 5))

      const currentRoutine = await db.getRoutine()
      setMorning(currentRoutine.morning)
      setNight(currentRoutine.night)

      const currentStats = await db.getStats()
      setStats(currentStats)
    }
    loadDashboardData()
  }, [])

  const toggleModal = (modal, isOpen) => {
    setActiveModals(prev => ({ ...prev, [modal]: isOpen }))
  }

  const handleSettingsAction = (id) => {
    if (id === 'logout') onLogout()
    if (id === 'edit-profile') onCompleteOnboarding()
    toggleModal('settings', false)
  }

  const handleNewScan = (id) => {
    // Navigate to results
    if (onStartAnalysis) onStartAnalysis(id)
  }

  const handleDeleteScan = async (id) => {
    if (window.confirm('Delete this scan? This action cannot be undone.')) {
      await db.deleteScan(id);
      const recentScans = await db.getAllScans()
      setScans(recentScans.slice(0, 5))
      const currentStats = await db.getStats()
      setStats(currentStats)
    }
  }

  const handleUpdateRoutine = async (m, n) => {
    setMorning(m)
    setNight(n)
    await db.updateRoutine({ morning: m, night: n })
  }

  const handleAddProduct = async (product) => {
    const newMorning = addSection === 'Morning' ? [...morning, product.productName] : morning
    const newNight = addSection === 'Night' ? [...night, product.productName] : night
    
    setMorning(newMorning)
    setNight(newNight)
    await db.updateRoutine({ morning: newMorning, night: newNight })
    toggleModal('addProduct', false)
  }

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
                    Hello, {userProfile?.userName || 'there'} 👋
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
      <DashboardNavbar 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        onOpenSettings={() => toggleModal('settings', true)}
      />
      
      <main className="max-w-7xl mx-auto pt-32 px-6 md:px-8 space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-serif text-4xl md:text-5xl font-bold text-text"
            >
              Welcome back, {userProfile?.userName || 'there'} 👋
            </motion.h1>
            <p className="text-text-muted font-medium text-lg">
              You've scanned {stats.totalScans} products so far.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal/10 border border-accent-teal/20 rounded-full"
          >
            <div className="w-2 h-2 bg-accent-teal rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-accent-teal-dark">{userProfile?.skinProfile?.skinType || 'Active'} skin profile</span>
          </motion.div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
             <HeroScanCard 
               onScan={() => toggleModal('camera', true)}
               onUpload={() => toggleModal('upload', true)}
             />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DailyRoutineCard 
                  morning={morning}
                  night={night}
                  onEdit={() => toggleModal('routine', true)}
                />
                <ScanHistoryCard 
                  scans={scans} 
                  onSelect={(id) => onStartAnalysis && onStartAnalysis(id)} 
                  onDelete={handleDeleteScan}
                />
             </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
             <SafetyScoreCard 
               score={stats.totalScans > 0 ? Math.round((stats.weeklyScans / Math.max(stats.totalScans, 1)) * 100) : 0} 
               hasRoutine={morning.length + night.length > 0} 
             />
             <InsightsCard insights={[]} skinProfile={userProfile?.skinProfile} /> 
             <SkinFactCard />
          </div>
        </div>
      </main>

      {/* Modals Container */}
      <SettingsModal 
        isOpen={activeModals.settings} 
        onClose={() => toggleModal('settings', false)}
        onAction={handleSettingsAction}
      />
      
      <CameraModal 
        isOpen={activeModals.camera} 
        onClose={() => toggleModal('camera', false)}
        onCapture={handleNewScan}
      />

      <UploadModal 
        isOpen={activeModals.upload} 
        onClose={() => toggleModal('upload', false)}
        onUpload={handleNewScan}
      />

      <RoutineModal 
        isOpen={activeModals.routine} 
        onClose={() => toggleModal('routine', false)}
        morningProducts={morning}
        nightProducts={night}
        onUpdateRoutine={handleUpdateRoutine}
        onOpenAddModal={(section) => {
          setAddSection(section)
          toggleModal('addProduct', true)
        }}
      />

      <AddProductModal 
        isOpen={activeModals.addProduct} 
        onClose={() => toggleModal('addProduct', false)}
        scannedProducts={scans}
        onAdd={handleAddProduct}
      />
    </div>
  )
}
