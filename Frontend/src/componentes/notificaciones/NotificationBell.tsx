"use client";

import React, { useState } from "react";
import { Bell, Clock, CheckCircle2, AlertCircle, Info, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import Badge from "@/componentes/ui/Badge";
import Button from "@/componentes/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Calendar size={16} className="text-accent" />;
      case "order": return <CheckCircle2 size={16} className="text-success" />;
      case "alert": return <AlertCircle size={16} className="text-danger" />;
      default: return <Info size={16} className="text-info" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-surface/50 transition-all group"
      >
        <Bell size={20} className={cn("text-muted group-hover:text-accent transition-colors", isOpen && "text-accent")} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent text-[9px] font-bold text-white rounded-full flex items-center justify-center border-2 border-bg">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 lg:w-96 frost border border-border rounded-[32px] shadow-float z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-surface/30">
                <h4 className="font-display text-fluid-sm font-bold">Notificaciones</h4>
                {unreadCount > 0 && (
                  <Badge variant="accent" size="xs">{unreadCount} nuevas</Badge>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto py-2 scrollbar-hide">
                {notifications.length > 0 ? (
                  notifications.map((notif: any) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        markAsRead.mutate(notif.id);
                        // setIsOpen(false);
                      }}
                      className={cn(
                        "w-full p-6 flex gap-4 text-left hover:bg-surface/50 transition-all border-b border-border/50 last:border-0",
                        !notif.isRead && "bg-accent/[0.02]"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                        !notif.isRead ? "bg-accent/10" : "bg-surface"
                      )}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start">
                          <p className={cn("text-[13px] leading-tight", !notif.isRead ? "font-bold text-text" : "text-muted")}>
                            {notif.title}
                          </p>
                          {!notif.isRead && <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5" />}
                        </div>
                        <p className="text-[11px] text-muted line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-subtle font-mono uppercase tracking-widest mt-2 flex items-center gap-1">
                          <Clock size={10} /> 12 min
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <Bell size={32} className="text-muted/20 mx-auto" />
                    <p className="text-fluid-xs text-muted">No tienes notificaciones</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-surface/30 border-t border-border">
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" fullWidth size="sm" className="text-[10px] font-bold uppercase tracking-widest">
                    Ver todo el historial
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
