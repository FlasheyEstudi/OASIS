"use client";

import React from "react";
import { X, ShieldCheck, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  title: string;
  subtitle?: string;
  prescriptionId?: string;
}

const QRModal = ({ isOpen, onClose, value, title, subtitle, prescriptionId }: QRModalProps) => {
  const [copied, setCopied] = React.useState(false);
  const [qrBackend, setQrBackend] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && prescriptionId) {
      const fetchQR = async () => {
        setLoading(true);
        try {
          const resp = await fetch(`/api/v1/prescriptions/${prescriptionId}/qr`);
          const data = await resp.json();
          if (data.success) {
            setQrBackend(data.data.qrBase64);
          }
        } catch (err) {
          console.error("Error fetching QR from backend:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchQR();
    } else {
      setQrBackend(null);
    }
  }, [isOpen, prescriptionId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm frost-heavy rounded-[32px] border border-border-light shadow-2xl overflow-hidden"
          >
            <div className="p-8 flex flex-col items-center text-center gap-6">
              <div className="w-full flex justify-end">
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full text-subtle transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-fluid-xl font-light">{title}</h3>
                {subtitle && <p className="text-fluid-xs text-muted uppercase tracking-widest">{subtitle}</p>}
              </div>

              {/* QR Container */}
              <div className="relative p-6 bg-white rounded-[24px] shadow-glow-accent/10 flex items-center justify-center min-h-[248px]">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <p className="text-[10px] font-mono text-muted uppercase animate-pulse">Generando...</p>
                  </div>
                ) : qrBackend ? (
                  <img 
                    src={qrBackend}
                    alt="Código QR Oficial Oasis"
                    className="w-[200px] h-[200px] animate-in fade-in zoom-in-95 duration-500"
                  />
                ) : (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}&color=0C1412`}
                    alt="Código QR de Validación"
                    className="w-[200px] h-[200px]"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 text-success text-[10px] font-mono uppercase tracking-[0.2em] bg-success/5 px-4 py-2 rounded-full border border-success/10">
                <ShieldCheck size={14} />
                Validado por Oasis Aura
              </div>

              <div className="w-full flex gap-3 pt-4">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={handleCopy}
                  icon={copied ? Check : Copy}
                >
                  {copied ? "Copiado" : "Copiar Código"}
                </Button>
                <Button variant="primary" fullWidth onClick={onClose}>
                  Finalizar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRModal;
