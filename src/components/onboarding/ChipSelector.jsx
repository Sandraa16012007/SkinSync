import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'

export default function ChipSelector({ 
  options, 
  value, 
  onChange, 
  isMulti = false, 
  showOther = true,
  otherValue = '',
  onOtherChange = () => {}
}) {
  const [isOtherActive, setIsOtherActive] = useState(!!otherValue)

  const handleToggle = (option) => {
    if (isMulti) {
      if (option === 'None') {
        onChange(['None'])
        setIsOtherActive(false)
        onOtherChange('')
      } else {
        const newValue = value.includes('None') ? [option] : 
          value.includes(option) ? value.filter(o => o !== option) : [...value, option]
        onChange(newValue.filter(o => o !== 'None'))
      }
    } else {
      onChange(option)
      if (option !== 'Other') {
        setIsOtherActive(false)
        onOtherChange('')
      }
    }
  }

  const handleOtherClick = () => {
    setIsOtherActive(true)
    if (!isMulti) onChange('Other')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {options.map((option) => {
          const isSelected = isMulti ? value.includes(option) : value === option
          return (
            <motion.button
              key={option}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleToggle(option)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border-2 ${
                isSelected 
                  ? 'bg-primary border-primary text-white shadow-[0_10px_20px_rgba(79,125,243,0.2)]' 
                  : 'bg-white border-border/60 text-text-muted hover:border-text-muted hover:bg-bg-warm/30 shadow-sm'
              }`}
            >
              {isSelected && <Check size={14} strokeWidth={3} />}
              {option}
            </motion.button>
          )
        })}

        {showOther && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOtherClick}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border-2 ${
              isOtherActive 
                ? 'bg-primary border-primary text-white shadow-[0_10px_20px_rgba(79,125,243,0.2)]' 
                : 'bg-white border-border/60 text-text-muted hover:border-text-muted hover:bg-bg-warm/30 shadow-sm'
            }`}
          >
            {isOtherActive ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
            Other
          </motion.button>
        )}
      </div>

      {isOtherActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs mx-auto"
        >
          <input
            autoFocus
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Please specify..."
            className="w-full px-5 py-3 bg-white border-2 border-primary/20 rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium shadow-sm"
          />
        </motion.div>
      )}
    </div>
  )
}
