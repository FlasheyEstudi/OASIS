'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Minus, ShoppingCart, CreditCard, Banknote, Shield, Check, MessageCircle, Pill, Trash2, Loader2, QrCode, AlertCircle, FileText } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck, DropLoader, EmptyState, OasisInput } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

const categories = ['Todos', 'Antibióticos', 'Analgésicos', 'Vitaminas', 'Gastro', 'Cuidado Personal']

export default function POS() {
  const { user, roleProfile } = useAuthStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  
  // Recipe Scanning states
  const [scanningOpen, setScanningOpen] = useState(false)
  const [recipeCode, setRecipeCode] = useState('')
  const [recipeData, setRecipeData] = useState<any>(null)
  const [validatingRecipe, setValidatingRecipe] = useState(false)
  const [recipeError, setRecipeError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  // Camera handling for real feel
  useEffect(() => {
    let stream: MediaStream | null = null;
    const video = document.getElementById('scanner-video') as HTMLVideoElement;

    async function startCamera() {
      if (scanningOpen) {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Su navegador no soporta acceso a la cámara");
          }
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (video) {
            video.srcObject = stream;
            setCameraActive(true);
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          setCameraActive(false);
        }
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setCameraActive(false);
      }
    }

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [scanningOpen]);

  // Insurance states
  const [insuranceOpen, setInsuranceOpen] = useState(false)
  const [policyNumber, setPolicyNumber] = useState('')
  const [validatingInsurance, setValidatingInsurance] = useState(false)
  const [coverageData, setCoverageData] = useState<any>(null)

  useEffect(() => {
    searchMeds()
  }, [search, selectedCategory])

  async function searchMeds() {
    setSearching(true)
    try {
      const res = await api.get('/pharmacy/inventory', { 
        search, 
        category: selectedCategory === 'Todos' ? undefined : selectedCategory,
        limit: 12 
      })
      if (res.success && res.data) {
        setResults(res.data)
      }
    } catch (err) {}
    finally { setSearching(false) }
  }

  const addToCart = (medBatch: any) => {
    const medInfo = medBatch.medication
    const existing = cartItems.find(it => it.medicationId === medInfo.id)
    
    if (existing) {
      if (existing.qty < medBatch.quantity) {
        setCartItems(prev => prev.map(it => it.medicationId === medInfo.id ? { ...it, qty: it.qty + 1 } : it))
      } else {
        alert('No hay más stock disponible en este lote')
      }
    } else {
      setCartItems([...cartItems, { 
        id: Date.now(),
        medicationId: medInfo.id,
        name: medInfo.name,
        price: medBatch.sellingPrice,
        qty: 1,
        stock: medBatch.quantity,
        requiresPrescription: medInfo.requiresPrescription || medInfo.controlledSubstance,
        batchId: medBatch.id
      }])
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = coverageData ? subtotal * (coverageData.copayPercentage / 100) : 0
  const total = subtotal - discount

  const incrementQty = (id: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (item.qty < item.stock) return { ...item, qty: item.qty + 1 }
        else {
          alert('Stock máximo del lote alcanzado')
          return item
        }
      }
      return item
    }))
  }

  const decrementQty = (id: number) => {
    setCartItems(prev => prev.map(item => item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item))
  }

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(it => it.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
    setCoverageData(null)
    setRecipeData(null)
  }

  async function validateRecipe() {
    setValidatingRecipe(true)
    setRecipeError(null)
    try {
      const res = await api.get('/prescriptions/verify', { code: recipeCode })
      if (res.success && res.data) {
        setRecipeData(res.data)
        // Auto-add items from prescription
        if (res.data.items) {
           for (const item of res.data.items) {
             // Find a batch for this medication
             const batchRes = await api.get('/pharmacy/inventory', { search: item.medication.name, limit: 1 })
             if (batchRes.success && batchRes.data[0]) {
               addToCart(batchRes.data[0])
             }
           }
        }
        setScanningOpen(false)
      } else {
        setRecipeError('Receta inválida o ya dispensada')
      }
    } catch (err) {
      setRecipeError('Error de validación')
    } finally {
      setValidatingRecipe(false)
    }
  }

  async function validateInsurance() {
    setValidatingInsurance(true)
    try {
      const res = await api.get('/insurance/estimate', { policy: policyNumber, amount: subtotal })
      if (res.success && res.data) {
        setCoverageData(res.data)
        setInsuranceOpen(false)
      } else {
        alert('Póliza no encontrada o inactiva')
      }
    } catch (err) {
      alert('Error validando seguro')
    } finally {
      setValidatingInsurance(false)
    }
  }

  const handleProcessSale = async () => {
    if (!selectedPayment) return
    setProcessing(true)
    try {
      // Create the order/sale using the checkout endpoint logic (FEFO)
      const res = await api.post('/orders', {
        pharmacyId: roleProfile?.pharmacyId,
        items: cartItems.map(it => ({ medicationId: it.medicationId, quantity: it.qty })),
        paymentMethod: selectedPayment,
        deliveryType: 'pickup',
        prescriptionId: recipeData?.id,
        insuranceId: coverageData?.id
      })
      if (res.success) {
        setPaymentOpen(false)
        setSuccessOpen(true)
        clearCart()
      }
    } catch (err) {
      alert('Error procesando venta')
    } finally {
      setProcessing(false)
    }
  }

  const sendWhatsApp = () => {
    // In a real app, this would get the customer phone
    alert('Factura enviada por WhatsApp al paciente')
    setSuccessOpen(false)
  }

  const needsPrescription = cartItems.some(it => it.requiresPrescription) && !recipeData

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-0 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Punto de Venta</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Dispensación rápida de medicamentos</p>
        </div>
        <OasisButton variant="outline" size="sm" onClick={() => setScanningOpen(true)}>
           <QrCode size={18} className="mr-2" /> Escanear Receta
        </OasisButton>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, genérico o código de barras..."
                className="w-full border-2 border-[#E0E0E0] bg-white px-4 py-3.5 pl-12 text-sm font-inter rounded-[20px] focus:border-[#0E8C5E] focus:outline-none shadow-sm transition-all"
              />
              {searching && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0E8C5E] animate-spin" />}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`capsule px-4 py-2 text-xs font-inter font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat ? 'oasis-gradient text-white shadow-md' : 'bg-[#FAFAFA] text-[#8A8A8A] hover:bg-[#E8F5EE] hover:text-[#0E8C5E]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {searching && results.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-50 animate-pulse rounded-3xl" />)}
            </div>
          ) : results.length === 0 ? (
            <EmptyState message="No se encontraron productos disponibles" icon="search" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((r) => (
                <OasisCard key={r.id} className="!p-4 border-2 border-transparent hover:border-[#0E8C5E]/20" onClick={() => addToCart(r)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                      <Pill size={20} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-nunito font-bold text-[#0E8C5E] text-lg">C${r.sellingPrice}</span>
                      <span className="text-[10px] font-inter text-[#8A8A8A]">Stock: {r.quantity}</span>
                    </div>
                  </div>
                  <h4 className="font-nunito font-bold text-sm text-[#4A4A4A] line-clamp-1">{r.medication.name}</h4>
                  <p className="font-inter text-[10px] text-[#8A8A8A] mb-3">{r.medication.dosageForm} • {r.medication.strength}</p>
                  
                  <div className="flex items-center justify-between">
                     <div className="flex gap-1">
                        {r.medication.requiresPrescription && <span className="text-[8px] font-bold text-[#F4A261] border border-[#F4A261] px-1 rounded uppercase">Receta</span>}
                        {r.medication.controlledSubstance && <span className="text-[8px] font-bold text-[#EF4444] border border-[#EF4444] px-1 rounded uppercase">Controlado</span>}
                     </div>
                     <div className="w-7 h-7 rounded-full bg-[#0E8C5E] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Plus size={16} />
                     </div>
                  </div>
                </OasisCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Shopping Cart (4 cols) */}
        <div className="lg:col-span-4">
          <OasisCard className="sticky top-6 !p-0 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FAFAFA]">
               <div className="flex items-center gap-2">
                 <ShoppingCart size={18} className="text-[#0E8C5E]" />
                 <h3 className="font-nunito font-bold text-[#4A4A4A]">Detalle de Venta</h3>
               </div>
               <span className="capsule bg-[#0E8C5E] text-white px-2 py-0.5 text-[10px] font-bold">{cartItems.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {cartItems.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <ShoppingCart size={48} className="mb-2" />
                    <p className="text-xs font-inter font-medium">Carrito vacío</p>
                 </div>
               ) : (
                 cartItems.map((item) => (
                   <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFAFA] border border-[#E0E0E0]/50 group">
                      <div className="flex-1 min-w-0">
                         <p className="font-inter font-bold text-xs text-[#4A4A4A] truncate">{item.name}</p>
                         <p className="font-inter text-[10px] text-[#8A8A8A]">C${item.price} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => decrementQty(item.id)} className="w-6 h-6 rounded-full bg-white border border-[#E0E0E0] flex items-center justify-center hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"><Minus size={12} /></button>
                         <span className="text-xs font-bold font-inter w-4 text-center">{item.qty}</span>
                         <button onClick={() => incrementQty(item.id)} className="w-6 h-6 rounded-full bg-white border border-[#E0E0E0] flex items-center justify-center hover:bg-[#E8F5EE] hover:text-[#0E8C5E] transition-colors"><Plus size={12} /></button>
                      </div>
                      <div className="w-16 text-right">
                         <p className="font-inter font-bold text-xs text-[#0E8C5E]">C${item.price * item.qty}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[#B0B0B0] hover:text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                   </div>
                 ))
               )}
            </div>

            <div className="p-5 bg-white border-t border-[#F0F0F0] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-inter text-[#8A8A8A]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#4A4A4A]">C${subtotal}</span>
                  </div>
                  {coverageData && (
                    <div className="flex justify-between text-xs font-inter text-[#0077B6] font-bold">
                      <span>Descuento Seguro ({coverageData.copayPercentage}%)</span>
                      <span>-C${discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-nunito font-extrabold text-lg text-[#4A4A4A]">Total a pagar</span>
                    <span className="font-nunito font-black text-2xl text-[#0E8C5E]">C${total}</span>
                  </div>
               </div>

               {needsPrescription && (
                 <div className="p-2 rounded-xl bg-[#FFF3E0] border border-[#F4A261]/20 flex items-center gap-2 animate-pulse">
                    <AlertCircle size={14} className="text-[#F4A261]" />
                    <p className="text-[9px] font-inter font-bold text-[#F4A261] uppercase tracking-tighter">Escanee receta para dispensar controlados</p>
                 </div>
               )}

               <div className="flex gap-2">
                  <OasisButton variant="outline" className="flex-1 h-12" onClick={() => setInsuranceOpen(true)} disabled={cartItems.length === 0}>
                     <Shield size={16} />
                  </OasisButton>
                  <OasisButton className="flex-[3] h-12 text-base" onClick={() => setPaymentOpen(true)} disabled={cartItems.length === 0 || needsPrescription}>
                     Cobrar Ahora
                  </OasisButton>
               </div>
            </div>
          </OasisCard>
        </div>
      </div>

      {/* Modals (Keep the same logic but refine design) */}
      <Dialog open={scanningOpen} onOpenChange={setScanningOpen}>
        <DialogContent className="modal-oasis max-w-sm">
           <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl">Validar Receta Digital</DialogTitle>
              <DialogDescription className="text-[10px] text-[#8A8A8A] font-inter">Escanee el código QR de la receta para dispensar medicamentos controlados.</DialogDescription>
           </DialogHeader>
           <div className="py-6 text-center space-y-4">
              <div className="w-full aspect-square mx-auto border-4 border-[#0E8C5E] rounded-3xl flex items-center justify-center relative overflow-hidden bg-black shadow-2xl">
                 <video 
                   id="scanner-video" 
                   autoPlay 
                   playsInline 
                   muted 
                   className={`w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                 />
                 {!cameraActive && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-2">
                     <Loader2 className="animate-spin" size={32} />
                     <span className="text-[10px] font-bold uppercase">Iniciando Cámara...</span>
                   </div>
                 )}
                 <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#0E8C5E] animate-scan-line shadow-[0_0_15px_#0E8C5E]" />
                 <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-48 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none" />
              </div>
              <p className="font-inter text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider">Apunta a la receta del paciente</p>
              <div className="relative">
                <input 
                  value={recipeCode}
                  onChange={(e) => setRecipeCode(e.target.value)}
                  placeholder="REC-XXXXXX"
                  className="w-full input-oasis border-2 border-[#E0E0E0] px-4 py-3 text-center font-bold tracking-widest text-lg uppercase" 
                />
                <FileText size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
              </div>
              {recipeError && <p className="text-[10px] font-bold text-[#EF4444] uppercase">{recipeError}</p>}
              <OasisButton fullWidth onClick={validateRecipe} disabled={!recipeCode || validatingRecipe}>
                {validatingRecipe ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Validar Receta'}
              </OasisButton>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={insuranceOpen} onOpenChange={setInsuranceOpen}>
        <DialogContent className="modal-oasis max-w-sm">
           <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl">Aplicar Seguro</DialogTitle>
              <DialogDescription className="text-xs text-[#8A8A8A]">Ingrese la póliza del paciente para calcular la cobertura.</DialogDescription>
           </DialogHeader>
           <div className="py-4 space-y-4">
              <OasisInput 
                label="Número de Póliza" 
                icon={<Shield size={16} />}
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="INS-XXXXXX"
              />
              <OasisButton fullWidth onClick={validateInsurance} disabled={!policyNumber || validatingInsurance}>
                {validatingInsurance ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Verificar Cobertura'}
              </OasisButton>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
             <DialogTitle className="font-nunito font-bold text-xl">Método de Pago</DialogTitle>
             <DialogDescription className="text-xs text-[#8A8A8A]">Seleccione cómo desea completar la transacción.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {[
              { id: 'cash', label: 'Efectivo', icon: Banknote, color: '#0E8C5E' },
              { id: 'card', label: 'Tarjeta Crédito/Débito', icon: CreditCard, color: '#0077B6' },
              { id: 'insurance', label: 'Seguro Médico', icon: Shield, color: '#F4A261' },
            ].map((method) => (
              <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all duration-200 ${selectedPayment === method.id ? 'border-[#0E8C5E] bg-[#E8F5EE]' : 'border-[#E0E0E0] bg-white hover:border-[#0E8C5E]/30'}`}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${method.color}15` }}><method.icon size={20} style={{ color: method.color }} /></div>
                <span className="font-inter font-bold text-sm text-[#4A4A4A]">{method.label}</span>
                {selectedPayment === method.id && <Check size={16} className="ml-auto text-[#0E8C5E]" />}
              </button>
            ))}
            <div className="pt-4">
              <OasisButton fullWidth size="lg" disabled={!selectedPayment || processing} onClick={handleProcessSale}>
                {processing ? <Loader2 size={18} className="animate-spin mr-2" /> : `Pagar C$${total}`}
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="modal-oasis max-w-sm text-center">
          <div className="py-8">
            <HeartbeatCheck size={80} />
            <h3 className="font-nunito font-black text-2xl text-[#4A4A4A] mt-6 mb-2">¡Venta Exitosa!</h3>
            <p className="font-inter text-sm text-[#8A8A8A] mb-8">El comprobante ha sido generado y el stock actualizado.</p>
            <div className="space-y-2">
               <OasisButton className="w-full h-12" onClick={sendWhatsApp}>
                  <MessageCircle size={18} className="mr-2" /> Enviar por WhatsApp
               </OasisButton>
               <OasisButton variant="outline" className="w-full h-12">
                  <FileText size={18} className="mr-2" /> Descargar PDF
               </OasisButton>
               <OasisButton variant="ghost" className="w-full" onClick={() => setSuccessOpen(false)}>Cerrar</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

