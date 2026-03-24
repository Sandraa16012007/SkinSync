import { User, RefreshCw, LogOut, Trash2, ChevronRight } from 'lucide-react'
import Modal from './Modal'

export default function SettingsModal({ isOpen, onClose, onAction }) {
  const settingsItems = [
    {
      id: 'edit-profile',
      icon: User,
      title: 'Edit Skin Profile',
      subtext: 'Retake onboarding and update your skin data',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      id: 'reset-data',
      icon: RefreshCw,
      title: 'Reset Data',
      subtext: 'Clear scans, routine, and preferences',
      color: 'text-accent-lavender-dark',
      bg: 'bg-accent-lavender/10'
    },
    {
      id: 'logout',
      icon: LogOut,
      title: 'Logout',
      subtext: 'Sign out of your account',
      color: 'text-text-muted',
      bg: 'bg-bg-warm'
    },
    {
      id: 'delete-account',
      icon: Trash2,
      title: 'Delete Account',
      subtext: 'This action is permanent and cannot be undone',
      color: 'text-red-500',
      bg: 'bg-red-50',
      isDestructive: true
    }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="p-4 space-y-2">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onAction(item.id)}
            className="w-full group flex items-start gap-4 p-5 rounded-2xl hover:bg-bg-warm/40 transition-all text-left border border-transparent hover:border-border/10"
          >
            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
               <item.icon className={item.color} size={22} />
            </div>
            
            <div className="flex-1 pr-4">
               <p className={`text-base font-bold ${item.isDestructive ? 'text-red-500' : 'text-text'}`}>
                  {item.title}
               </p>
               <p className="text-xs font-medium text-text-muted leading-relaxed mt-0.5">
                  {item.subtext}
               </p>
            </div>
            
            <div className="self-center">
               <ChevronRight size={18} className="text-text-muted/20 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-8 bg-bg-warm/20 mt-4">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 text-center">
            SkinSync v1.0.4 • Made with precision
         </p>
      </div>
    </Modal>
  )
}
