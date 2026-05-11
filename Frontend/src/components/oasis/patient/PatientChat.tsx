'use client'

import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { OasisButton, OasisIconButton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const conversations = [
  { name: 'Dr. Carlos Ruiz', lastMsg: 'Recuerda tomar la amoxicilina cada 8 horas', time: '10:30 AM', initials: 'CR' },
  { name: 'Dra. María Martínez', lastMsg: 'Tu resultado de laboratorio está listo', time: 'Ayer', initials: 'MM' },
]

const initialChatMessages = [
  { from: 'doctor', text: 'Hola María, ¿cómo te sientes hoy?', time: '09:00' },
  { from: 'patient', text: 'Hola Dr. Me siento mejor, ya no tengo fiebre', time: '09:05' },
  { from: 'doctor', text: '¡Excelente! Recuerda tomar la amoxicilina cada 8 horas. No suspendas aunque te sientas bien.', time: '09:10' },
  { from: 'patient', text: 'Sí doctor, estoy cumpliendo el tratamiento. ¿Puedo tomar ibuprofeno si me duele algo?', time: '09:15' },
  { from: 'doctor', text: 'Sí, puedes tomar ibuprofeno 400mg si hay dolor, pero preferiblemente con alimentos. Nos vemos en el control la próxima semana.', time: '09:20' },
]

export default function PatientChat() {
  const { navigate } = useNavigation()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState(initialChatMessages)
  const [messageInput, setMessageInput] = useState('')

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    setMessages(prev => [...prev, { from: 'patient' as const, text: messageInput.trim(), time: timeStr }])
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
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
            <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center font-nunito font-bold text-xs text-[#0E8C5E]">CR</div>
            <div>
              <div className="font-nunito font-bold text-sm text-[#4A4A4A]">Dr. Carlos Ruiz</div>
              <div className="text-[10px] font-inter text-[#0E8C5E]">En línea</div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 ${
                msg.from === 'patient'
                  ? 'oasis-gradient text-white rounded-[18px] rounded-br-[4px]'
                  : 'bg-[#E8F5EE] text-[#4A4A4A] rounded-[18px] rounded-bl-[4px]'
              }`}>
                <p className="font-inter text-sm">{msg.text}</p>
                <span className={`text-[9px] font-inter ${msg.from === 'patient' ? 'text-white/60' : 'text-[#8A8A8A]'}`}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E0E0E0] p-3">
          <div className="flex items-center gap-2">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
              placeholder="Escribe un mensaje..."
            />
            <OasisIconButton
              onClick={handleSendMessage}
              icon={<Send size={16} />}
              variant="primary"
              size="md"
              disabled={!messageInput.trim()}
              className="oasis-gradient text-white"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('patient-profile')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Chat</h1>
        </div>
      </div>
      <div className="flex-1 px-4 py-4 space-y-3">
        {conversations.map((conv, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedChat(conv.name)
              setMessages(initialChatMessages)
              setMessageInput('')
            }}
            className="w-full flex items-center gap-3 p-4 rounded-[16px] bg-[#FAFAFA] hover:bg-[#E8F5EE]/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center font-nunito font-bold text-sm text-[#0E8C5E]">{conv.initials}</div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-inter font-semibold text-sm text-[#4A4A4A]">{conv.name}</div>
              <div className="font-inter text-xs text-[#8A8A8A] truncate">{conv.lastMsg}</div>
            </div>
            <span className="text-[10px] font-inter text-[#8A8A8A]">{conv.time}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
