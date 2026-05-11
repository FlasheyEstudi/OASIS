'use client'

import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export const oasisToast = {
  success: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md border border-[#E8F5EE] rounded-[24px] p-4 shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
        <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] shrink-0">
          <CheckCircle size={24} />
        </div>
        <div className="flex-1">
          <p className="font-nunito font-bold text-sm text-[#4A4A4A]">{message}</p>
          {description && <p className="font-inter text-[10px] text-[#8A8A8A] uppercase tracking-wider">{description}</p>}
        </div>
        <button onClick={() => toast.dismiss(t)} className="text-[#B0B0B0] hover:text-[#4A4A4A]">
          <X size={16} />
        </button>
      </div>
    ))
  },
  error: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md border border-[#FEE2E2] rounded-[24px] p-4 shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] shrink-0">
          <AlertCircle size={24} />
        </div>
        <div className="flex-1">
          <p className="font-nunito font-bold text-sm text-[#4A4A4A]">{message}</p>
          {description && <p className="font-inter text-[10px] text-[#8A8A8A] uppercase tracking-wider">{description}</p>}
        </div>
        <button onClick={() => toast.dismiss(t)} className="text-[#B0B0B0] hover:text-[#4A4A4A]">
          <X size={16} />
        </button>
      </div>
    ))
  },
  info: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md border border-[#E0F2FE] rounded-[24px] p-4 shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
        <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0077B6] shrink-0">
          <Info size={24} />
        </div>
        <div className="flex-1">
          <p className="font-nunito font-bold text-sm text-[#4A4A4A]">{message}</p>
          {description && <p className="font-inter text-[10px] text-[#8A8A8A] uppercase tracking-wider">{description}</p>}
        </div>
        <button onClick={() => toast.dismiss(t)} className="text-[#B0B0B0] hover:text-[#4A4A4A]">
          <X size={16} />
        </button>
      </div>
    ))
  }
}
