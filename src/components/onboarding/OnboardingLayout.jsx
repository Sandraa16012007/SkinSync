import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, LayoutDashboard, LogOut } from 'lucide-react'
import ProgressBar from './ProgressBar'
import StepCard from './StepCard'
import ChipSelector from './ChipSelector'

const STEPS = [
  {
    id: 'skinType',
    title: 'How would you describe your skin?',
    type: 'single',
    options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
  },
  {
    id: 'concerns',
    title: 'What are your main skin concerns?',
    type: 'multi',
    options: ['Acne / Breakouts', 'Pigmentation / Dark spots', 'Dryness / Dehydration', 'Oiliness', 'Sensitivity / Redness', 'Aging / Fine lines', 'Dullness'],
  },
  {
    id: 'sensitivities',
    title: 'Do you react to any of these?',
    type: 'multi',
    options: ['Fragrance', 'Alcohol', 'Essential oils', 'Sulfates', 'Parabens', 'None / Not sure'],
  },
  {
    id: 'actives',
    title: 'Are you currently using any active ingredients?',
    type: 'multi',
    options: ['Retinol / Retinoids', 'AHA (Glycolic, Lactic)', 'BHA (Salicylic Acid)', 'Vitamin C', 'Niacinamide', 'Benzoyl Peroxide', 'None'],
  },
  {
    id: 'reactivity',
    title: 'How does your skin usually react?',
    type: 'single',
    options: ['Rarely reacts', 'Sometimes gets irritated', 'Easily irritated'],
  }
]

export default function OnboardingLayout({ onComplete, onLogout }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('skinsync_onboarding')
    return saved ? JSON.parse(saved) : {
      skinType: '',
      concerns: [],
      sensitivities: [],
      actives: [],
      reactivity: '',
      other: {}
    }
  })

  useEffect(() => {
    localStorage.setItem('skinsync_onboarding', JSON.stringify(data))
  }, [data])

  const currentStep = STEPS[currentStepIdx]
  const isFirstStep = currentStepIdx === 0
  const isLastStep = currentStepIdx === STEPS.length - 1

  const handleValueChange = (val) => {
    setData(prev => ({ ...prev, [currentStep.id]: val }))
  }

  const handleOtherChange = (val) => {
    setData(prev => ({ 
      ...prev, 
      other: { ...prev.other, [currentStep.id]: val } 
    }))
  }

  const handleNext = () => {
    if (isLastStep) {
      onComplete(data)
    } else {
      setCurrentStepIdx(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIdx(prev => prev - 1)
    }
  }

  const isNextDisabled = () => {
    const val = data[currentStep.id]
    if (Array.isArray(val)) return val.length === 0
    return !val
  }

  const selectedCount = Array.isArray(data[currentStep.id]) ? data[currentStep.id].length : 0

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col pt-24 pb-12 px-6">
      {/* Onboarding Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <span className="font-serif text-2xl font-bold tracking-tight">SkinSync</span>
        </div>
        <div className="flex items-center gap-6">
           <button className="text-sm font-bold text-text-muted hover:text-text transition-all flex items-center gap-2">
              <LayoutDashboard size={18} />
              Dashboard
           </button>
           <button 
             onClick={onLogout}
             className="text-sm font-bold text-text-muted hover:text-text transition-all flex items-center gap-2"
           >
              <LogOut size={18} />
              Logout
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center">
        <ProgressBar currentStep={currentStepIdx + 1} totalSteps={STEPS.length} />

        <AnimatePresence mode="wait">
          <StepCard
            key={currentStep.id}
            stepKey={currentStep.id}
            title={currentStep.title}
            subtitle={currentStep.type === 'multi' ? `${selectedCount} selected` : ""}
            onBack={handleBack}
            onNext={handleNext}
            isNextDisabled={isNextDisabled()}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          >
            <ChipSelector
              options={currentStep.options}
              isMulti={currentStep.type === 'multi'}
              value={data[currentStep.id]}
              onChange={handleValueChange}
              otherValue={data.other[currentStep.id] || ''}
              onOtherChange={handleOtherChange}
            />
          </StepCard>
        </AnimatePresence>
      </div>
    </div>
  )
}
