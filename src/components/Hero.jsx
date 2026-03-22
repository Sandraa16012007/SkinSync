import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, User, Heart, MessageSquare } from 'lucide-react'

/* ─── Rotating Text Wheel (Carousel) ─── */

function RotatingTextWheel({ text, className }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className={`absolute pointer-events-none opacity-[0.12] ${className}`}
    >
      <svg viewBox="0 0 600 600" className="w-[800px] h-[800px]">
        <path
          id="circlePath"
          d="M 300,300 m -220,0 a 220,220 0 1,1 440,0 a 220,220 0 1,1 -440,0"
          fill="transparent"
        />
        <text className="text-[16px] uppercase tracking-[0.4em] font-medium fill-text">
          <textPath href="#circlePath" startOffset="0%">
            {text} • {text} • {text}
          </textPath>
        </text>
      </svg>
    </motion.div>
  )
}

/* ─── Floating Modals / Cards ─── */

function ReviewCard({ style }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="absolute top-[60%] right-[-8%] w-[200px] bg-white/80 backdrop-blur-lg p-4 rounded-3xl shadow-xl border border-white/40 hidden lg:block"
    >
      <div className="flex gap-3 mb-2">
        <div className="flex -space-x-1">
          {[1,2,3,4,5].map(i => <Sparkles key={i} size={10} className="text-accent-teal fill-accent-teal" />)}
        </div>
        <span className="text-[9px] font-bold text-text-muted italic">"Game changer!"</span>
      </div>
      <p className="text-[10px] text-text leading-tight font-medium">Finally found a serum that doesn't break me out. SkinSync is 10/10.</p>
    </motion.div>
  )
}

function SafetyTag({ style }) {
  return (
    <motion.div
      style={style}
      animate={{ x: [0, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      className="absolute top-[40%] left-[-12%] bg-accent-teal/10 backdrop-blur-md px-4 py-2 rounded-full border border-accent-teal/20 flex items-center gap-2 shadow-sm"
    >
      <Shield size={12} className="text-accent-teal" />
      <span className="text-[10px] font-bold text-accent-teal uppercase tracking-widest">EWG Verified</span>
    </motion.div>
  )
}

function ScanCard({ style }) {
  return (
    <motion.div
      style={style}
      className="absolute top-[5%] left-[10%] w-[280px] md:w-[320px] bg-bg-card rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/50 overflow-hidden"
    >
      <div className="px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Live Analysis</span>
        </div>
        <Sparkles size={14} className="text-accent-teal" />
      </div>
      <div className="px-6 pb-4">
        <div className="h-[180px] bg-bg-warm/60 rounded-3xl flex items-center justify-center relative overflow-hidden ring-1 ring-black/5">
          <div className="w-16 h-28 bg-white rounded-2xl shadow-sm border border-border/20 flex flex-col items-center justify-center gap-2">
             <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <Shield size={16} className="text-primary" />
             </div>
             <div className="w-10 h-1.5 bg-bg-warm rounded-full" />
             <div className="w-8 h-1 bg-bg-warm rounded-full" />
          </div>
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 left-4 px-3 py-1.5 bg-white shadow-lg text-[10px] font-bold text-text rounded-xl border border-border/10"
          >
            Niacinamide • 10%
          </motion.div>
          <motion.div
            animate={{ y: [3, -3, 3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 right-4 px-3 py-1.5 bg-primary text-white shadow-lg text-[10px] font-bold rounded-xl"
          >
            Zinc PCA
          </motion.div>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="flex justify-between items-end mb-2">
           <span className="text-[11px] font-bold text-text">Ingredient Safety</span>
           <span className="text-[10px] text-primary font-bold">Safe for oily skin</span>
        </div>
        <div className="h-2 bg-bg-warm rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(79,125,243,0.3)]"
            initial={{ width: 0 }}
            animate={{ width: '88%' }}
            transition={{ duration: 3, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function WelcomeModal({ style }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="absolute bottom-[10%] left-[-5%] w-[240px] bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/50"
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 shrink-0 bg-accent-peach/20 rounded-full flex items-center justify-center">
          <Heart size={18} className="text-accent-peach fill-accent-peach" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-text leading-tight">Perfect Match!</p>
          <p className="text-[10px] text-text-muted leading-relaxed">
            This serum is 100% compatible with your current routine.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ConfidenceWidget({ style }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="absolute top-[15%] right-[0%] w-[180px] bg-bg-card/80 backdrop-blur-md p-4 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-white/40"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
           <svg className="w-full h-full -rotate-90">
             <circle cx="20" cy="20" r="18" fill="none" stroke="#E8EEFE" strokeWidth="4" />
             <motion.circle
               cx="20" cy="20" r="18" fill="none" stroke="#4F7DF3" strokeWidth="4" strokeDasharray="113"
               initial={{ strokeDashoffset: 113 }}
               animate={{ strokeDashoffset: 113 * (1 - 0.98) }}
               transition={{ duration: 2, delay: 1.5 }}
             />
           </svg>
           <span className="absolute text-[10px] font-bold text-primary">98%</span>
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-text">Confidence</span>
           <span className="text-[8px] text-text-muted">Clinical grade</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Hero Section ─── */

export default function Hero({ onAuth }) {
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleMouseMove = (e) => {
    if (isMobile) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  const springConfig = { damping: 40, stiffness: 60 }
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig)
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), springConfig)

  const parallaxXDeep = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig)
  const parallaxYDeep = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig)

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[95vh] flex items-center pt-24 pb-12 px-6 lg:px-8 overflow-hidden bg-[#F7F6F3]"
    >
      {/* Background Blobs + Flow Lines */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
           animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
           }}
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-accent-lavender/10 blur-[100px] rounded-full"
        />
        <motion.div
           animate={{
              rotate: [360, 0],
              scale: [1, 1.2, 1],
           }}
           transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-peach/10 blur-[120px] rounded-full"
        />
        <RotatingTextWheel text="Your skin's best friend • Science backed • Clinical-grade Analysis • Safe and personalized" className="-top-[2%] left-[0%]" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-[1.1fr_1fr] gap-12 items-center z-10">
        {/* Left: Text + CTA */}
        <div className="order-2 md:order-1 pt-6 text-center md:text-left relative">
          
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm rounded-full border border-border/40 mb-6 mx-auto md:mx-0"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-[11px] font-bold text-text-muted tracking-wide uppercase">Unlock your skin's potential</span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="font-serif text-[3rem] md:text-[4rem] lg:text-[4.5rem] font-semibold text-text leading-[1.04] tracking-tight mb-6"
          >
            Decode your
            <br />
            skincare{' '}
            <span className="relative italic text-primary font-normal">
              in
              <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-6 text-primary/20 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                 <path d="M 0,10 Q 50,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
            <br />
            <span className="text-primary"> seconds. </span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="text-text-muted text-base md:text-lg mb-10 max-w-[450px] mx-auto md:mx-0 leading-relaxed font-medium"
          >
            Scan any product. Know if it's safe for your skin with personalized, clinical-grade analysis. Your personal skin expert, in your pocket.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-2 justify-center md:justify-start"
          >
            <motion.button
              onClick={onAuth}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 bg-text text-bg text-sm font-bold rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-black transition-all"
            >
              Get Started for Free
            </motion.button>
            <motion.button
              onClick={onAuth}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3.5 bg-white text-text text-sm font-bold rounded-full border border-border/60 hover:border-text-muted transition-all"
            >
              Scan Now
            </motion.button>
          </motion.div>
        </div>

        {/* Right: Floating UI Mockup — Reimagined */}
        <div className="order-1 md:order-2 relative h-[450px] md:h-[550px] flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
             {/* Decorative Circles — Animated with Framer Motion */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
               className="absolute w-[400px] h-[400px] border border-primary/10 rounded-full" 
             />
             <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
               className="absolute w-[300px] h-[300px] border border-primary/5 rounded-full" 
             />
          </div>

          <div className="relative w-full h-full">
            {/* Main Content Area */}
            <ScanCard
              style={
                isMobile
                  ? {}
                  : { x: parallaxX, y: parallaxY }
              }
            />

            <WelcomeModal
              style={
                isMobile
                  ? { bottom: '5%', left: '5%' }
                  : { bottom: '10%', left: '-5%', x: parallaxXDeep, y: parallaxYDeep }
              }
            />

            <ConfidenceWidget
              style={
                isMobile
                  ? { top: '5%', right: '5%' }
                  : { top: '5%', right: '-5%', x: parallaxXDeep, y: parallaxY }
              }
            />

            <ReviewCard 
               style={
                 isMobile
                   ? { display: 'none' }
                   : { top: '65%', right: '-10%', x: parallaxX, y: parallaxYDeep }
               }
            />

            {/* Additional Floating Element: Skin Type Badge */}
            <motion.div
               animate={{ y: [-10, 10, -10] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute bottom-[-5%] right-[15%] px-4 py-2 bg-accent-teal shadow-xl rounded-full text-white text-[10px] font-bold"
            >
               Oily & Sensitive
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
