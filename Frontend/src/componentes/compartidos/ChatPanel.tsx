"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, User, Search, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/componentes/ui/Avatar";
import Input from "@/componentes/ui/Input";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const ChatPanel = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chats: Chat[] = [
    { id: "1", name: "Dr. Mateo Estudi", lastMessage: "Hola, ¿cómo sigues con el tratamiento?", time: "10:30 AM", unread: 2, online: true },
    { id: "2", name: "Farmacia San José", lastMessage: "Tu pedido está en camino.", time: "9:15 AM", unread: 0, online: false },
    { id: "3", name: "Dra. Elena Ramos", lastMessage: "Cita confirmada para mañana.", time: "Ayer", unread: 0, online: true },
  ];

  const messages: Message[] = [
    { id: "1", text: "Hola Dr. Mateo, tengo una duda sobre la dosis.", sender: "me", timestamp: "10:25 AM", status: "read" },
    { id: "2", text: "Hola, claro, dime qué sucede.", sender: "other", timestamp: "10:28 AM", status: "read" },
    { id: "3", text: "¿Debo tomarlo antes o después de las comidas?", sender: "me", timestamp: "10:30 AM", status: "delivered" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, messages]);

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-card/30 frost border border-border rounded-[32px] overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={cn(
        "w-full md:w-80 border-r border-border flex flex-col bg-surface/20",
        selectedChat && "hidden md:flex"
      )}>
        <div className="p-6 space-y-4">
          <h3 className="font-display text-fluid-lg font-light">Mensajes</h3>
          <Input label="Buscador" icon={Search} placeholder="Buscar conversación..." size="small" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:bg-surface/50",
                selectedChat?.id === chat.id ? "bg-accent/10 border border-accent/20" : "border border-transparent"
              )}
            >
              <div className="relative">
                <Avatar name={chat.name} src={chat.avatar} size="md" />
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-bg rounded-full" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-fluid-xs font-bold truncate">{chat.name}</h4>
                  <span className="text-[9px] text-muted font-mono">{chat.time}</span>
                </div>
                <p className="text-[11px] text-muted truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-transparent",
        !selectedChat && "hidden md:flex items-center justify-center text-center p-12"
      )}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="p-6 border-b border-border flex items-center justify-between bg-surface/10">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedChat(null)}>
                  Volver
                </Button>
                <Avatar name={selectedChat.name} src={selectedChat.avatar} size="sm" />
                <div>
                  <h4 className="text-fluid-sm font-bold">{selectedChat.name}</h4>
                  <span className="text-[10px] text-success font-mono uppercase tracking-widest">En línea</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" icon={Phone} />
                <Button variant="ghost" size="sm" icon={Video} />
                <Button variant="ghost" size="sm" icon={MoreVertical} />
              </div>
            </header>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center py-4">
                <Badge variant="glass" size="xs">Hoy</Badge>
              </div>
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.sender === "me" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-5 py-3 rounded-[24px]",
                    msg.sender === "me" 
                      ? "bg-accent text-white rounded-tr-none shadow-glow-accent/20" 
                      : "bg-surface/80 border border-border rounded-tl-none frost"
                  )}>
                    <p className="text-fluid-xs leading-relaxed">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <span className="text-[9px] text-muted font-mono">{msg.timestamp}</span>
                    {msg.sender === "me" && (
                      <span className={cn(
                        "text-[9px] font-mono font-bold uppercase",
                        msg.status === "read" ? "text-accent" : "text-muted"
                      )}>
                        {msg.status}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat Input */}
            <footer className="p-6 border-t border-border bg-surface/10">
              <div className="flex items-center gap-4 bg-card/50 border border-border rounded-2xl p-2 frost">
                <Button variant="ghost" size="sm" icon={Paperclip} />
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-fluid-xs px-2"
                  onKeyDown={(e) => e.key === "Enter" && message && setMessage("")}
                />
                <Button variant="ghost" size="sm" icon={Smile} />
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={Send} 
                  disabled={!message}
                  onClick={() => setMessage("")}
                  className="rounded-xl shadow-glow"
                />
              </div>
            </footer>
          </>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-[28px] bg-accent/10 text-accent mx-auto flex items-center justify-center">
              <Send size={40} />
            </div>
            <div>
              <h3 className="font-display text-fluid-xl font-light">Tu Centro de Comunicación</h3>
              <p className="text-fluid-xs text-muted max-w-xs mx-auto mt-2">
                Selecciona una conversación para empezar a chatear con tus doctores o farmacias.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
