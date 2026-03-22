import { motion } from 'framer-motion'
import { LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react'

export default function DashboardNavbar({ activeTab = 'dashboard', onLogout, onNavigate }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/40 px-8 h-20 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => onNavigate('landing')}
      >
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_10px_20px_rgba(79,125,243,0.3)]">
          <Shield className="text-white" size={20} strokeWidth={2.5} />
        </div>
        <span className="font-serif text-2xl font-bold tracking-tight text-text">SkinSync</span>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-1 bg-bg-warm/50 p-1.5 rounded-2xl border border-border/20">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-text-muted hover:text-text'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'settings' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={18} />
          Logout
        </motion.button>
      </div>
    </nav>
  )
}
