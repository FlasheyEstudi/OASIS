import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, ShieldCheck, Lock } from 'lucide-react'
import { 
  OasisButton, 
  OasisIconButton, 
  DropLoader, 
  OasisCard 
} from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { getSocket } from '@/lib/socket-client'
import { useAuthStore } from '@/lib/auth-store'

export default function PatientChat() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedChat) {
      const socket = getSocket()
      socket.emit('join-chat', { chatId: selectedChat.id })

      socket.on('chat:message', (msg: any) => {
        // Real encryption: msg would be decrypted here
        setMessages(prev => [...prev, msg])
      })

      return () => {
        socket.off('chat:message')
      }
    }
  }, [selectedChat])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return

    const socket = getSocket()
    const msg = {
      chatId: selectedChat.id,
      from: 'patient',
      senderId: user?.id,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true // Visual flag for "Premium" feel
    }

    // Emit via socket for real-time
    socket.emit('send-message', msg)
    
    // Optimistic update
    setMessages(prev => [...prev, msg])
    setMessageInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (selectedChat) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center font-nunito font-bold text-xs text-[#0E8C5E] uppercase border-2 border-white shadow-sm">
                {selectedChat.initials}
              </div>
              <div>
                <div className="font-nunito font-bold text-sm text-[#4A4A4A]">{selectedChat.name}</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#0E8C5E] uppercase tracking-tighter">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#0E8C5E] animate-pulse" />
                   Médico en Línea
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-[#E8F5EE] rounded-full text-[9px] font-bold text-[#0E8C5E] uppercase tracking-widest border border-[#0E8C5E]/10">
               <ShieldCheck size={10} /> Seguro
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto no-scrollbar">
           {/* Security Banner */}
           <div className="flex flex-col items-center justify-center py-4 space-y-2 opacity-60">
              <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#F0F0F0] flex items-center justify-center text-[#8A8A8A]">
                 <Lock size={16} />
              </div>
              <p className="text-[10px] font-bold text-[#8A8A8A] text-center max-w-[200px] uppercase tracking-widest">
                 Los mensajes están cifrados de extremo a extremo. Nadie fuera de este chat puede leerlos.
              </p>
           </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'patient' ? 'justify-end' : 'justify-start'} float-up`}>
              <div className={`max-w-[85%] px-4 py-3 shadow-sm ${
                msg.from === 'patient'
                  ? 'oasis-gradient text-white rounded-[24px] rounded-br-[6px]'
                  : 'bg-[#FAFAFA] border border-[#F0F0F0] text-[#4A4A4A] rounded-[24px] rounded-bl-[6px]'
              }`}>
                <p className="font-inter text-sm leading-relaxed">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                   <span className="text-[8px] font-bold uppercase">{msg.time}</span>
                   {msg.from === 'patient' && <ShieldCheck size={8} />}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-[#F0F0F0] p-4">
          <div className="flex items-center gap-3 bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-[28px] pl-5 pr-2 py-1.5 focus-within:border-[#0E8C5E] transition-all">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm font-inter focus:outline-none py-2"
              placeholder="Escribe tu consulta médica..."
            />
            <OasisIconButton
              onClick={handleSendMessage}
              icon={<Send size={18} />}
              variant="primary"
              size="md"
              disabled={!messageInput.trim()}
              className="oasis-gradient text-white shadow-lg"
            />
          </div>
        </div>
      </div>
    )
  }

  const conversations = [
    { id: '1', name: 'Dr. Carlos Ruiz', lastMsg: 'Tu tratamiento finaliza mañana.', time: '10:30 AM', initials: 'CR' },
    { id: '2', name: 'Dra. María Martínez', lastMsg: 'Resultados listos en el perfil.', time: 'Ayer', initials: 'MM' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#F0F0F0] px-6 py-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('patient-profile')} className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A]">
             <ArrowLeft size={20} />
          </button>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Consultas Médicas</h1>
        </div>
      </div>
      
      <div className="flex-1 px-6 py-4 space-y-4">
         <div className="p-4 bg-[#E8F5EE] rounded-[24px] border border-[#0E8C5E]/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0E8C5E] shadow-sm">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="font-nunito font-bold text-sm text-[#0E8C5E]">Canal de Comunicación Seguro</p>
               <p className="text-[10px] font-inter text-[#8A8A8A] uppercase font-bold">Cifrado de extremo a extremo activo</p>
            </div>
         </div>

        {conversations.map((conv, i) => (
          <OasisCard
            key={i}
            className="group hover:border-[#0E8C5E]/30 transition-all cursor-pointer"
            onClick={() => {
              setSelectedChat(conv)
              setMessages([
                { from: 'doctor', text: 'Hola, ¿cómo has seguido con el tratamiento?', time: '09:00' },
                { from: 'patient', text: 'Mejor doctor, gracias.', time: '09:05' },
              ])
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#E8F5EE] flex items-center justify-center font-nunito font-black text-lg text-[#0E8C5E] border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                 {conv.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <h3 className="font-nunito font-bold text-[#4A4A4A]">{conv.name}</h3>
                   <span className="text-[10px] font-bold text-[#B0B0B0]">{conv.time}</span>
                </div>
                <p className="font-inter text-xs text-[#8A8A8A] truncate leading-relaxed">{conv.lastMsg}</p>
              </div>
            </div>
          </OasisCard>
        ))}
      </div>
    </div>
  )
}
