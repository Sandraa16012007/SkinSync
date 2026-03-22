import { motion } from 'framer-motion'
import { Camera, Upload, Sparkles } from 'lucide-react'

export default function HeroScanCard({ onScan, onUpload }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative overflow-hidden bg-primary rounded-[2.5rem] p-10 md:p-14 text-white shadow-[0_40px_100px_rgba(79,125,243,0.25)] group"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-teal/20 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Sparkles size={16} className="text-accent-teal" />
            <span className="text-xs font-black uppercase tracking-widest text-white/90">Instant Decode</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Scan a product
          </h1>
          
          <p className="text-white/80 text-lg font-medium max-w-md mx-auto md:mx-0">
            Upload or scan any skincare product to instantly decode its ingredients and check compatibility.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onScan}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <Camera size={20} />
              Scan Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.97 }}
              onClick={onUpload}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-sm hover:border-white/40 transition-all"
            >
              <Upload size={20} />
              Upload Image
            </motion.button>
          </div>
        </div>
        
        <div className="hidden lg:block">
           <div className="w-56 h-56 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 border-2 border-dashed border-white/20 rounded-full"
              />
              <Camera size={64} className="text-white/40" strokeWidth={1.5} />
           </div>
        </div>
      </div>
    </motion.div>
  )
}
