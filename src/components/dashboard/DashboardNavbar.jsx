import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react'

export default function DashboardNavbar({ activeTab = 'dashboard', onLogout, onNavigate, onOpenSettings }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/40 px-8 h-20 flex items-center justify-between">
      <Link 
        to="/"
        className="flex items-center gap-2 cursor-pointer group"
      >
        <span className="font-serif text-2xl font-bold tracking-tight text-text ml-5">SkinSync</span>
      </Link>

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
            onClick={onOpenSettings}
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
