'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Minus, ShoppingCart, CreditCard, Banknote, Shield, Check, MessageCircle, Pill, Trash2, Loader2, QrCode, AlertCircle, FileText } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck, DropLoader } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

export default function POS() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
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

  // Insurance states
  const [insuranceOpen, setInsuranceOpen] = useState(false)
  const [policyNumber, setPolicyNumber] = useState('')
  const [validatingInsurance, setValidatingInsurance] = useState(false)
  const [coverageData, setCoverageData] = useState<any>(null)

  useEffect(() => {
    if (search.length > 1) {
      const timer = setTimeout(searchMeds, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [search])

  async function searchMeds() {
    setSearching(true)
    try {
      const res = await api.get('/pharmacy/inventory', { search, limit: 10 })
      if (res.success && res.data) {
        setResults(res.data)
      }
    } catch (err) {}
    finally { setSearching(false) }
  }

  const addToCart = (med: any) => {
    const medInfo = med.medication || med
    const existing = cartItems.find(it => it.medicationId === medInfo.id)
    
    if (existing) {
      setCartItems(prev => prev.map(it => it.medicationId === medInfo.id ? { ...it, qty: it.qty + 1 } : it))
    } else {
      setCartItems([...cartItems, { 
        id: Date.now(),
        medicationId: medInfo.id,
        name: medInfo.name,
        price: medInfo.price || 100,
        qty: 1,
        stock: med.quantity || 100,
        requiresPrescription: medInfo.requiresPrescription || medInfo.controlledSubstance
      }])
    }
    setSearch('')
    setResults([])
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = coverageData ? subtotal * (coverageData.coveragePercentage / 100) : 0
  const total = subtotal - discount

  const incrementQty = (id: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item))
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
      const res = await api.get(`/prescriptions/verify`, { code: recipeCode })
      if (res.success && res.data) {
        setRecipeData(res.data)
        // Add medications from recipe to cart
        if (res.data.items) {
           res.data.items.forEach((item: any) => {
             addToCart({ ...item.medication, quantity: item.quantity })
           })
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
      const res = await api.post('/pharmacy/sales', {
        items: cartItems.map(it => ({ medicationId: it.medicationId, quantity: it.qty, price: it.price })),
        paymentMethod: selectedPayment,
        totalAmount: total,
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
    const message = encodeURIComponent(
      `Factura OASIS Farmacia\n\n` +
      cartItems.map(item => `- ${item.name} x${item.qty}: C$${item.price * item.qty}`).join('\n') +
      `\n\nSubtotal: C$${subtotal}` +
      (discount > 0 ? `\nSeguro: -C$${discount}` : '') +
      `\nTotal: C$${total}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
    setSuccessOpen(false)
  }

  const needsPrescription = cartItems.some(it => it.requiresPrescription) && !recipeData

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-0 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Punto de Venta</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Venta directa y dispensación de recetas</p>
        </div>
        <div className="flex items-center gap-3">
           <OasisButton variant="outline" onClick={() => setScanningOpen(true)}>
             <QrCode size={18} className="mr-2" /> Escanear Receta
           </OasisButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Search + Cart */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar medicamento..."
              className="w-full border-2 border-[#E0E0E0] bg-white px-4 py-3 pl-12 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none shadow-sm"
            />
            {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0E8C5E] animate-spin" />}
            
            {results.length > 0 && (
              <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-[20px] shadow-xl border border-[#E0E0E0] overflow-hidden">
                {results.map((r: any) => (
                  <button key={r.id} onClick={() => addToCart(r)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#E8F5EE] transition-colors border-b border-[#F0F0F0] last:border-0 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center"><Pill size={18} className="text-[#0E8C5E]" /></div>
                      <div>
                        <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{r.medication.name}</p>
                        <p className="font-inter text-xs text-[#8A8A8A]">{r.medication.category} - Stock: {r.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       {r.medication.requiresPrescription && <FileText size={14} className="text-[#F4A261]" title="Requiere receta" />}
                       <p className="font-nunito font-bold text-[#0E8C5E]">C${r.medication.price || 100}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <OasisCard>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={18} className="text-[#0E8C5E]" />
              <h3 className="font-nunito font-bold text-base text-[#4A4A4A]">Carrito de Venta</h3>
              <span className="capsule bg-[#E8F5EE] text-[#0E8C5E] px-2 py-0.5 text-[10px] font-inter font-semibold">{cartItems.length} items</span>
              {cartItems.length > 0 && (
                <OasisButton variant="danger" size="sm" className="ml-auto" onClick={clearCart}>
                  <Trash2 size={12} className="mr-1" /> Limpiar
                </OasisButton>
              )}
            </div>
            
            {recipeData && (
               <div className="mb-4 p-3 rounded-xl bg-[#E0F2FF] border border-[#0077B6]/20 flex items-center gap-3">
                  <FileText className="text-[#0077B6]" size={20} />
                  <div>
                    <p className="font-inter font-bold text-xs text-[#0077B6]">Receta vinculada: #{recipeData.code}</p>
                    <p className="font-inter text-[10px] text-[#4A4A4A]">Paciente: {recipeData.patient?.user?.name}</p>
                  </div>
                  <X size={14} className="ml-auto cursor-pointer" onClick={() => setRecipeData(null)} />
               </div>
            )}

            {cartItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FAFAFA] flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={32} className="text-[#E0E0E0]" />
                </div>
                <p className="font-inter text-sm text-[#8A8A8A]">Agregue productos desde la búsqueda</p>
              </div>
            ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#FAFAFA] border border-[#F0F0F0]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <span className="font-inter font-semibold text-sm text-[#4A4A4A]">{item.name}</span>
                       {item.requiresPrescription && <span className="text-[9px] font-bold text-[#F4A261] uppercase border border-[#F4A261] px-1 rounded">R</span>}
                    </div>
                    <div className="font-inter text-xs text-[#8A8A8A]">C${item.price} c/u</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => decrementQty(item.id)} className="w-7 h-7 rounded-full bg-[#E0E0E0] flex items-center justify-center hover:bg-[#E8F5EE] transition-colors"><Minus size={12} /></button>
                    <span className="font-inter font-bold text-sm w-6 text-center">{item.qty}</span>
                    <button onClick={() => incrementQty(item.id)} className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center hover:bg-[#0E8C5E] hover:text-white text-[#0E8C5E] transition-colors"><Plus size={12} /></button>
                    <button onClick={() => removeItem(item.id)} className="ml-2 text-[#8A8A8A] hover:text-[#EF4444]"><Trash2 size={14} /></button>
                  </div>
                  <div className="font-inter font-bold text-sm text-[#0E8C5E] w-16 text-right">C${item.price * item.qty}</div>
                </div>
              ))}
            </div>
            )}
          </OasisCard>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2 space-y-4">
          <OasisCard className="sticky top-6">
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Totalización</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-inter">
                <span className="text-[#8A8A8A]">Subtotal</span>
                <span className="text-[#4A4A4A] font-medium">C${subtotal}</span>
              </div>
              {coverageData && (
                <div className="flex justify-between text-sm font-inter text-[#0077B6]">
                  <span>Descuento Seguro ({coverageData.coveragePercentage}%)</span>
                  <span>-C${discount}</span>
                </div>
              )}
            </div>
            <div className="border-t border-[#E0E0E0] pt-4 mb-6">
              <div className="flex justify-between font-nunito font-bold text-2xl">
                <span>Total</span>
                <span className="text-[#0E8C5E]">C${total}</span>
              </div>
            </div>

            {needsPrescription && (
              <div className="mb-4 p-3 rounded-xl bg-[#FFF3E0] border border-[#F4A261]/20 flex items-center gap-2">
                 <AlertCircle size={16} className="text-[#F4A261] shrink-0" />
                 <p className="text-[10px] font-inter font-bold text-[#F4A261] uppercase">Se requiere escanear receta para continuar</p>
              </div>
            )}

            <OasisButton className="w-full h-12 text-base" onClick={() => setPaymentOpen(true)} disabled={cartItems.length === 0 || needsPrescription}>
              Cobrar C${total}
            </OasisButton>
            
            {!coverageData && cartItems.length > 0 && (
               <button onClick={() => setInsuranceOpen(true)} className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-inter font-bold text-[#0077B6] hover:underline">
                 <Shield size={14} /> Aplicar Seguro Médico
               </button>
            )}
          </OasisCard>
        </div>
      </div>

      {/* QR Scanning Simulation Modal */}
      <Dialog open={scanningOpen} onOpenChange={setScanningOpen}>
        <DialogContent className="modal-oasis max-w-sm">
           <DialogHeader><DialogTitle className="font-nunito font-bold text-xl">Validar Receta Digital</DialogTitle></DialogHeader>
           <div className="py-6 text-center space-y-4">
              <div className="w-48 h-48 mx-auto border-4 border-dashed border-[#0E8C5E] rounded-3xl flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[#E8F5EE]/30 group-hover:bg-[#E8F5EE]/10 transition-colors" />
                 <QrCode size={80} className="text-[#0E8C5E] relative z-10" />
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#0E8C5E] animate-scan-line" />
              </div>
              <p className="font-inter text-xs text-[#8A8A8A]">Posicione el código QR frente a la cámara o ingrese el código manual</p>
              <input 
                value={recipeCode}
                onChange={(e) => setRecipeCode(e.target.value)}
                placeholder="Código de receta (Ej: REC-123)"
                className="w-full input-oasis border-2 border-[#E0E0E0] px-4 py-2 text-center font-bold" 
              />
              {recipeError && <p className="text-[10px] font-bold text-[#EF4444] uppercase">{recipeError}</p>}
              <OasisButton fullWidth onClick={validateRecipe} disabled={!recipeCode || validatingRecipe}>
                {validatingRecipe ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Validar Receta
              </OasisButton>
           </div>
        </DialogContent>
      </Dialog>

      {/* Insurance Validation Modal */}
      <Dialog open={insuranceOpen} onOpenChange={setInsuranceOpen}>
        <DialogContent className="modal-oasis max-w-sm">
           <DialogHeader><DialogTitle className="font-nunito font-bold text-xl">Validar Seguro</DialogTitle></DialogHeader>
           <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-inter text-[#8A8A8A] ml-2">Número de Póliza</label>
                <input 
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="INS-000000"
                  className="w-full input-oasis border-2 border-[#E0E0E0] px-4 py-3 font-bold mt-1" 
                />
              </div>
              <OasisButton fullWidth onClick={validateInsurance} disabled={!policyNumber || validatingInsurance}>
                {validatingInsurance ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Verificar Cobertura
              </OasisButton>
           </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Método de Pago</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            {[
              { id: 'cash', label: 'Efectivo', icon: Banknote, color: '#0E8C5E' },
              { id: 'card', label: 'Tarjeta', icon: CreditCard, color: '#0077B6' },
              { id: 'insurance', label: 'Seguro / Mixto', icon: Shield, color: '#F4A261' },
            ].map((method) => (
              <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-[16px] border-2 transition-all duration-200 ${selectedPayment === method.id ? 'border-[#0E8C5E] bg-[#E8F5EE]' : 'border-[#E0E0E0] bg-white hover:border-[#0E8C5E]/30'}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${method.color}15` }}><method.icon size={20} style={{ color: method.color }} /></div>
                <span className="font-inter font-semibold text-sm text-[#4A4A4A]">{method.label}</span>
              </button>
            ))}
            <div className="pt-2">
              <OasisButton className="w-full" disabled={!selectedPayment || processing} onClick={handleProcessSale}>
                {processing ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Confirmar C${total}
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="modal-oasis max-w-sm text-center">
          <div className="py-6">
            <HeartbeatCheck size={72} />
            <h3 className="font-nunito font-bold text-xl text-[#4A4A4A] mt-4 mb-2">¡Transacción Completa!</h3>
            <p className="font-inter text-sm text-[#8A8A8A] mb-6 text-center px-4">Inventario actualizado mediante lógica FEFO.</p>
            <OasisButton variant="outline" size="sm" onClick={sendWhatsApp} fullWidth>
              <MessageCircle size={16} className="mr-2" /> Comprobante Digital (WA)
            </OasisButton>
            <OasisButton className="mt-2" variant="ghost" onClick={() => setSuccessOpen(false)} fullWidth>Nueva Venta</OasisButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

