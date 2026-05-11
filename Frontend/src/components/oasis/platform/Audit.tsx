'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { OasisCard } from '../shared/shared-components'

const auditLogs = [
  { id: 1, user: 'Dr. Carlos Ruiz', action: 'CREAR', entity: 'Receta #0012', date: '20 Ene 2025 09:15', details: { oldValues: null, newValues: { paciente: 'María López', medicamentos: ['Amoxicilina 500mg', 'Paracetamol 500mg'], diagnóstico: 'Infección de vías urinarias' } } },
  { id: 2, user: 'Recepcionista Ana', action: 'ACTUALIZAR', entity: 'Cita #0345', date: '20 Ene 2025 08:30', details: { oldValues: { hora: '09:00', doctor: 'Dr. Ruiz' }, newValues: { hora: '10:00', doctor: 'Dr. Ruiz' } } },
  { id: 3, user: 'Admin Clínica', action: 'CREAR', entity: 'Doctor - Dra. Sofía López', date: '19 Ene 2025 16:45', details: { oldValues: null, newValues: { nombre: 'Dra. Sofía López', especialidad: 'Dermatología', email: 'sofia@clinica.com' } } },
  { id: 4, user: 'Dr. Carlos Ruiz', action: 'ELIMINAR', entity: 'Receta #0008', date: '19 Ene 2025 14:20', details: { oldValues: { paciente: 'Juan Pérez', estado: 'borrador' }, newValues: null } },
  { id: 5, user: 'Recepcionista Ana', action: 'CREAR', entity: 'Cita #0344', date: '19 Ene 2025 11:00', details: { oldValues: null, newValues: { paciente: 'Ana Gómez', doctor: 'Dra. Martínez', hora: '10:30' } } },
]

export default function Audit() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Auditoría</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Registro de todas las acciones del sistema</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por usuario, acción..." className="w-full border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" />
        </div>
        <select className="border-2 border-[#E0E0E0] rounded-full px-4 py-2.5 text-sm font-inter focus:border-[#0E8C5E] focus:outline-none">
          <option>Todas las acciones</option>
          <option>CREAR</option>
          <option>ACTUALIZAR</option>
          <option>ELIMINAR</option>
        </select>
      </div>

      <div className="bg-white card-oasis overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E0E0E0]">
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Usuario</th>
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Acción</th>
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Entidad</th>
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Fecha</th>
              <th className="text-right font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <>
                <tr key={log.id} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/20 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                  <td className="px-5 py-3 font-inter font-medium text-sm text-[#4A4A4A]">{log.user}</td>
                  <td className="px-5 py-3">
                    <span className={`capsule px-2 py-0.5 text-[10px] font-inter font-semibold ${
                      log.action === 'CREAR' ? 'bg-[#E8F5EE] text-[#0E8C5E]' :
                      log.action === 'ACTUALIZAR' ? 'bg-[#E0F2FE] text-[#0077B6]' :
                      'bg-[#FEE2E2] text-[#EF4444]'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#8A8A8A]">{log.entity}</td>
                  <td className="px-5 py-3 hidden md:table-cell font-inter text-xs text-[#8A8A8A]">{log.date}</td>
                  <td className="px-5 py-3 text-right">
                    {expanded === log.id ? <ChevronUp size={14} className="text-[#8A8A8A]" /> : <ChevronDown size={14} className="text-[#8A8A8A]" />}
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr key={`${log.id}-detail`}>
                    <td colSpan={5} className="px-5 py-4 bg-[#FAFAFA]">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-inter font-semibold text-xs text-[#8A8A8A] mb-1">Valores Anteriores</div>
                          <pre className="bg-white rounded-[14px] p-3 text-xs font-inter text-[#4A4A4A] overflow-auto max-h-32">
                            {log.details.oldValues ? JSON.stringify(log.details.oldValues, null, 2) : '— N/A —'}
                          </pre>
                        </div>
                        <div>
                          <div className="font-inter font-semibold text-xs text-[#8A8A8A] mb-1">Valores Nuevos</div>
                          <pre className="bg-white rounded-[14px] p-3 text-xs font-inter text-[#4A4A4A] overflow-auto max-h-32">
                            {log.details.newValues ? JSON.stringify(log.details.newValues, null, 2) : '— N/A —'}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
