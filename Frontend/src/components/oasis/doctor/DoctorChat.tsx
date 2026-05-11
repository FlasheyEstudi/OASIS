'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, EmptyState } from '@/components/oasis/shared/shared-components'
import { MessageCircle, Send, Search } from 'lucide-react'

export default function DoctorChat() {
  const [chats, setChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadChats() }, [])

  async function loadChats() {
    setLoading(true)
    const res = await api.get('/chats', { limit: 50 })
    if (res.success && (res as any).data) setChats((res as any).data)
    setLoading(false)
  }

  async function loadMessages(chatId: string) {
    setActiveChat(chatId)
    const res = await api.get(`/chats/${chatId}/messages`, { limit: 50 })
    if (res.success && (res as any).data) setMessages((res as any).data)
    await api.put(`/chats/${chatId}/read`)
  }

  async function sendMessage() {
    if (!activeChat || !newMsg.trim()) return
    const res = await api.post(`/chats/${activeChat}/messages`, { message: newMsg })
    if (res.success) { setNewMsg(''); loadMessages(activeChat) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6"><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Chat</h1><p className="font-inter text-sm text-[#8A8A8A]">Mensajería con pacientes</p></div>
      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-200px)]">
        <div className="border border-[#E0E0E0] rounded-[20px] overflow-hidden flex flex-col bg-white">
          <div className="p-3 border-b border-[#E0E0E0]"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input placeholder="Buscar..." className="w-full input-oasis border border-[#E0E0E0] pl-9 pr-3 py-2 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none" /></div></div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? <EmptyState message="Sin conversaciones" /> : chats.map((c: any) => (
              <button key={c.id} onClick={() => loadMessages(c.id)}
                className={`w-full text-left p-3 border-b border-[#E0E0E0] hover:bg-[#E8F5EE]/50 transition-colors ${activeChat === c.id ? 'bg-[#E8F5EE]' : ''}`}>
                <p className="font-inter font-semibold text-sm text-[#4A4A4A] truncate">{c.participant?.name || c.type}</p>
                <p className="font-inter text-xs text-[#8A8A8A] truncate">{c.lastMessage || ''}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="border border-[#E0E0E0] rounded-[20px] overflow-hidden flex flex-col bg-white">
          {activeChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.sender?.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-[14px] px-4 py-2 ${m.sender?.role === 'doctor' ? 'bg-[#0E8C5E] text-white' : 'bg-[#E8F5EE] text-[#4A4A4A]'}`}>
                      <p className="font-inter text-sm">{m.message}</p>
                      <p className={`font-inter text-[10px] mt-1 ${m.sender?.role === 'doctor' ? 'text-white/60' : 'text-[#8A8A8A]'}`}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-[#E0E0E0] flex gap-2">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe un mensaje..." className="flex-1 input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
                <OasisButton onClick={sendMessage} disabled={!newMsg.trim()}><Send size={16} /></OasisButton>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><MessageCircle size={40} className="text-[#E0E0E0] mx-auto mb-2" /><p className="font-inter text-sm text-[#8A8A8A]">Selecciona una conversación</p></div></div>
          )}
        </div>
      </div>
    </div>
  )
}
