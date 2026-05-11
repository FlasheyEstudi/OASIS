'use client'

import React from 'react'
import { Bell, X, Package, Calendar, Activity, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'order' | 'appointment' | 'info' | 'success' | 'alert'
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Pedido Confirmado',
    message: 'Tu pedido en Farmacia El Ahorro ha sido recibido.',
    time: 'Hace 5 min',
    type: 'order',
    read: false
  },
  {
    id: '2',
    title: 'Cita Mañana',
    message: 'Recuerda tu cita con el Dr. Martínez a las 9:00 AM.',
    time: 'Hace 1 hora',
    type: 'appointment',
    read: false
  },
  {
    id: '3',
    title: 'Nueva Función',
    message: 'Ahora puedes agregar miembros de tu familia a tu perfil.',
    time: 'Ayer',
    type: 'info',
    read: true
  }
]

interface NotificationsTrayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsTray({ open, onOpenChange }: NotificationsTrayProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package size={16} className="text-[#0E8C5E]" />
      case 'appointment': return <Calendar size={16} className="text-[#0077B6]" />
      case 'alert': return <AlertCircle size={16} className="text-[#EF4444]" />
      case 'success': return <CheckCircle size={16} className="text-[#0E8C5E]" />
      default: return <Info size={16} className="text-[#8A8A8A]" />
    }
  }

  const getBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-[#E8F5EE]'
      case 'appointment': return 'bg-[#E0F2FF]'
      case 'alert': return 'bg-[#FEE2E2]'
      case 'success': return 'bg-[#E8F5EE]'
      default: return 'bg-[#FAFAFA]'
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-white">
        <SheetHeader className="p-6 border-b border-[#F0F0F0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                <Bell size={20} />
              </div>
              <div>
                <SheetTitle className="font-nunito font-bold text-xl">Notificaciones</SheetTitle>
                <SheetDescription className="text-xs font-inter">Mantente al día con tu salud</SheetDescription>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#8A8A8A]">
              <X size={18} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockNotifications.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAFAFA] mx-auto flex items-center justify-center text-[#B0B0B0]">
                <Bell size={32} />
              </div>
              <p className="text-sm font-inter text-[#8A8A8A]">No tienes notificaciones por ahora</p>
            </div>
          ) : (
            mockNotifications.map((n) => (
              <div key={n.id} className={`p-4 rounded-2xl border ${n.read ? 'bg-white border-[#F0F0F0]' : 'bg-[#FAFAFA] border-[#0E8C5E]/20'} relative group transition-all hover:shadow-md`}>
                {!n.read && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#0E8C5E]" />}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${getBg(n.type)} flex items-center justify-center flex-shrink-0`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-nunito font-bold text-sm text-[#4A4A4A] truncate">{n.title}</p>
                    <p className="font-inter text-xs text-[#8A8A8A] leading-relaxed mt-0.5">{n.message}</p>
                    <p className="text-[10px] font-bold text-[#B0B0B0] uppercase mt-2">{n.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#F0F0F0]">
          <button className="w-full py-3 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] text-xs font-bold text-[#8A8A8A] hover:text-[#0E8C5E] transition-all">
            Marcar todas como leídas
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
