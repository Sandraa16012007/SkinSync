import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Shield, User, Mail, Lock, Eye, EyeOff, ArrowRight, X } from 'lucide-react'
import { storage } from '../utils/storage'

export default function Auth({ onClose, onSuccess, initialMode = 'signup' }) {
  const [mode, setMode] = useState(initialMode) 
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setShowPassword(false)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // One-time signup logic
    storage.setLoggedIn(true, formData.name || 'User')
    if (onSuccess) onSuccess()
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-text/5 backdrop-blur-md"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-[1000px] bg-bg rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Illustration / Info */}
        <div className="hidden md:flex md:w-[45%] bg-bg-warm relative overflow-hidden flex-col justify-between p-12">
          {/* Decorative Blobs */}
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-accent-lavender/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-accent-peach/20 blur-[80px] rounded-full" />

          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-8">
                <span className="font-serif text-2xl font-bold tracking-tight opacity-40">SkinSync</span>
             </div>
             
             <h2 className="font-serif text-3xl font-semibold leading-tight mb-6">
                {mode === 'login' 
                  ? "Welcome back to your skin's safe space." 
                  : "Start decoding your skincare today."}
             </h2>
             
             <p className="text-text-muted text-sm leading-relaxed mb-8 font-medium">
                {mode === 'login'
                  ? "Re-access your personalized safety scores and tracking."
                  : "Join 50,000+ enthusiasts using clinical-grade intelligence to protect their skin barrier."}
             </p>

             <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50">
                   <div className="w-8 h-8 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal">
                      <Sparkles size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-text">Ingredient Scanner</span>
                      <span className="text-[10px] text-text-muted">Plain English breakdowns for any INCI list.</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-text">Condition Detector</span>
                      <span className="text-[10px] text-text-muted">AI-powered early guidance for skin issues.</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 text-[10px] text-text-muted/60 font-medium">
             © 2026 SkinSync. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 text-text-muted hover:text-text transition-colors rounded-full hover:bg-bg-warm"
          >
            <X size={20} />
          </button>

          <div className="max-w-[360px] mx-auto w-full">
            <header className="mb-10 text-center md:text-left">
              <h3 className="font-serif text-3xl font-bold text-text mb-2">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-sm text-text-muted font-medium">
                {mode === 'login' 
                  ? "Enter your credentials to continue" 
                  : "Fill in the details to start your journey"}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3.5 bg-bg-warm/40 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="hello@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-bg-warm/40 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Password</label>
                   {mode === 'login' && (
                     <a href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</a>
                   )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-bg-warm/40 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-text text-bg rounded-2xl font-bold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:bg-black transition-all flex items-center justify-center gap-2 group mt-8"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center sm:text-left">
               <p className="text-sm text-text-muted font-medium">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={toggleMode}
                    className="text-primary font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
               </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
