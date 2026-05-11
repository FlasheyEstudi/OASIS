'use client'

import React from 'react'

// Drop Loader - Water drop with network nodes that pulses rhythmically
export function DropLoader({ size = 40, color = '#0E8C5E' }: { size?: number; color?: string }) {
  const h = size * 1.2
  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: h }}>
        {/* Ripple rings */}
        <div 
          className="absolute inset-0 rounded-full ripple-effect"
          style={{ border: `2px solid ${color}20`, width: size, height: size }}
        />
        <div 
          className="absolute inset-0 rounded-full ripple-effect"
          style={{ border: `2px solid ${color}15`, width: size, height: size, animationDelay: '0.5s' }}
        />
        {/* The drop with network nodes */}
        <svg
          className="drop-loader relative z-10"
          width={size}
          height={h}
          viewBox="0 0 64 78"
          fill="none"
        >
          {/* Left curve */}
          <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C32 56 26 54 24 46C22 38 26 20 32 4Z" fill={color} />
          {/* Right curve */}
          <path d="M32 4C32 4 50 24 50 40C50 50.5 42 56 32 56C32 56 38 54 40 46C42 38 38 20 32 4Z" fill={color} />
          {/* Inner highlight */}
          <ellipse cx="26" cy="32" rx="5" ry="10" fill="white" opacity="0.18" />
          {/* Network lines */}
          <path d="M26 54C22 58 18 60 14 62" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <path d="M32 56C32 60 32 62 32 66" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <path d="M38 54C42 58 46 60 50 62" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          {/* Nodes */}
          <circle cx="14" cy="64" r="4" fill="#0077B6" opacity="0.9" />
          <circle cx="32" cy="68" r="4" fill="#0077B6" opacity="0.9" />
          <circle cx="50" cy="64" r="4" fill="#0077B6" opacity="0.9" />
          <circle cx="14" cy="64" r="1.5" fill="white" opacity="0.5" />
          <circle cx="32" cy="68" r="1.5" fill="white" opacity="0.5" />
          <circle cx="50" cy="64" r="1.5" fill="white" opacity="0.5" />
        </svg>
      </div>
    </div>
  )
}

// Wave Skeleton - Smooth shimmering waves
export function WaveSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`wave-shimmer rounded-[14px] ${className}`} />
  )
}

// Card skeleton with wave shimmer
export function CardSkeleton() {
  return (
    <div className="card-oasis bg-white p-6 space-y-4">
      <div className="flex items-center gap-3">
        <WaveSkeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <WaveSkeleton className="h-4 w-3/4" />
          <WaveSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <WaveSkeleton className="h-3 w-full" />
      <WaveSkeleton className="h-3 w-5/6" />
    </div>
  )
}

// Heartbeat check animation
export function HeartbeatCheck({ size = 48, color = '#0E8C5E' }: { size?: number; color?: string }) {
  return (
    <div className="heartbeat-check flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill={color} opacity="0.15" />
        <circle cx="24" cy="24" r="18" fill={color} opacity="0.3" />
        <path
          d="M20 24L23 27L30 19"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// Error state component
export function ErrorState({ 
  message = "Ups, algo se derramó. Intenta de nuevo", 
  onRetry 
}: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg width="80" height="100" viewBox="0 0 64 78" fill="none" className="mb-4">
        {/* Left curve */}
        <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C32 56 26 54 24 46C22 38 26 20 32 4Z" fill="#F4A261" opacity="0.3" />
        {/* Right curve */}
        <path d="M32 4C32 4 50 24 50 40C50 50.5 42 56 32 56C32 56 38 54 40 46C42 38 38 20 32 4Z" fill="#F4A261" opacity="0.3" />
        <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C42 56 50 50.5 50 40C50 24 32 4 32 4Z" stroke="#F4A261" strokeWidth="1.5" fill="none" />
        {/* Nodes */}
        <circle cx="14" cy="64" r="3" fill="#F4A261" opacity="0.4" />
        <circle cx="32" cy="68" r="3" fill="#F4A261" opacity="0.4" />
        <circle cx="50" cy="64" r="3" fill="#F4A261" opacity="0.4" />
      </svg>
      <p className="font-nunito font-bold text-lg text-[#4A4A4A] mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="capsule oasis-gradient text-white px-6 py-2.5 font-inter font-medium text-sm hover:scale-103 transition-transform duration-200"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

// Empty state component
export function EmptyState({ 
  message, 
  icon = 'drop' 
}: { message: string; icon?: 'drop' | 'search' | 'heart' | 'family' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg width="100" height="125" viewBox="0 0 64 78" fill="none" className="mb-4">
        {/* Left curve */}
        <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C32 56 26 54 24 46C22 38 26 20 32 4Z" fill="#E8F5EE" />
        {/* Right curve */}
        <path d="M32 4C32 4 50 24 50 40C50 50.5 42 56 32 56C32 56 38 54 40 46C42 38 38 20 32 4Z" fill="#E8F5EE" />
        {icon === 'drop' && (
          <>
            <ellipse cx="26" cy="32" rx="5" ry="10" fill="#0E8C5E" opacity="0.1" />
            <circle cx="48" cy="26" r="3" fill="#0E8C5E" opacity="0.08" />
          </>
        )}
        {icon === 'search' && (
          <circle cx="32" cy="34" r="10" stroke="#0E8C5E" strokeWidth="2" fill="none" />
        )}
        {icon === 'heart' && (
          <path d="M32 42C32 42 24 34 24 30C24 26 28 24 32 30C36 24 40 26 40 30C40 34 32 42 32 42Z" fill="#0E8C5E" opacity="0.25" />
        )}
        {icon === 'family' && (
          <>
            <circle cx="24" cy="34" r="4" fill="#0E8C5E" opacity="0.15" />
            <circle cx="40" cy="34" r="4" fill="#0E8C5E" opacity="0.15" />
            <circle cx="32" cy="40" r="3" fill="#0E8C5E" opacity="0.1" />
          </>
        )}
        {/* Network nodes */}
        <circle cx="14" cy="64" r="4" fill="#0E8C5E" opacity="0.15" />
        <circle cx="32" cy="68" r="4" fill="#0077B6" opacity="0.15" />
        <circle cx="50" cy="64" r="4" fill="#0E8C5E" opacity="0.15" />
        <path d="M26 54C22 58 18 60 14 62" stroke="#0077B6" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
        <path d="M32 56C32 60 32 62 32 66" stroke="#0077B6" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
        <path d="M38 54C42 58 46 60 50 62" stroke="#0077B6" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
      </svg>
      <p className="font-nunito font-bold text-base text-[#4A4A4A] max-w-[280px]">{message}</p>
    </div>
  )
}

// Oasis Logo - Gota Conectora con nodos de red
export function OasisLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 24, md: 32, lg: 44 }
  const s = sizes[size]
  return (
    <div className="flex items-center gap-2">
      <svg width={s} height={s * 1.2} viewBox="0 0 64 78" fill="none">
        <defs>
          <linearGradient id="logoDropGrad" x1="16" y1="4" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0E8C5E" />
            <stop offset="1" stopColor="#0A6B45" />
          </linearGradient>
          <linearGradient id="logoNodeGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0077B6" />
            <stop offset="1" stopColor="#005F92" />
          </linearGradient>
          <linearGradient id="logoNodeGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0E8C5E" />
            <stop offset="1" stopColor="#0077B6" />
          </linearGradient>
        </defs>
        {/* Drop shape - left curve */}
        <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C32 56 26 54 24 46C22 38 26 20 32 4Z" fill="url(#logoDropGrad)" />
        {/* Drop shape - right curve */}
        <path d="M32 4C32 4 50 24 50 40C50 50.5 42 56 32 56C32 56 38 54 40 46C42 38 38 20 32 4Z" fill="url(#logoDropGrad)" />
        {/* Inner highlight */}
        <ellipse cx="26" cy="32" rx="5" ry="10" fill="white" opacity="0.18" />
        {/* Network lines */}
        <path d="M26 54C22 58 18 60 14 62" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M32 56C32 60 32 62 32 66" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M38 54C42 58 46 60 50 62" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        {/* Cross connections */}
        <path d="M14 62C20 66 26 66 32 66" stroke="#0077B6" strokeWidth="1" strokeLinecap="round" opacity="0.25" strokeDasharray="2 2" />
        <path d="M50 62C44 66 38 66 32 66" stroke="#0077B6" strokeWidth="1" strokeLinecap="round" opacity="0.25" strokeDasharray="2 2" />
        {/* Nodes */}
        <circle cx="14" cy="64" r="4" fill="url(#logoNodeGrad2)" opacity="0.9" />
        <circle cx="32" cy="68" r="4" fill="url(#logoNodeGrad1)" opacity="0.9" />
        <circle cx="50" cy="64" r="4" fill="url(#logoNodeGrad2)" opacity="0.9" />
        {/* Node icons - small white dots */}
        <circle cx="14" cy="64" r="1.5" fill="white" opacity="0.5" />
        <circle cx="32" cy="68" r="1.5" fill="white" opacity="0.5" />
        <circle cx="50" cy="64" r="1.5" fill="white" opacity="0.5" />
      </svg>
      <span className="font-nunito font-bold text-[#0E8C5E]" style={{ fontSize: size === 'sm' ? '18px' : size === 'md' ? '22px' : '28px' }}>
        Oasis
      </span>
    </div>
  )
}

// Floating Action Button (Drop shape)
export function DropFAB({ 
  onClick, 
  icon, 
  color = '#0E8C5E',
  label 
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  color?: string;
  label?: string 
}) {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-24 right-6 z-50 flex items-center gap-2 md:bottom-8"
      title={label}
    >
      {label && (
        <span className="hidden md:block bg-white oasis-shadow px-4 py-2 rounded-full text-sm font-inter font-medium text-[#4A4A4A] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {label}
        </span>
      )}
      <div 
        className="w-14 h-14 flex items-center justify-center text-white shadow-lg hover:scale-103 transition-all duration-200"
        style={{ 
          background: color === '#F4A261' ? '#F4A261' : `linear-gradient(135deg, #0E8C5E, #0077B6)`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          boxShadow: `0 6px 24px ${color}40`
        }}
      >
        {icon}
      </div>
    </button>
  )
}

// Oasis Card component with hover effect
export function OasisCard({ 
  children, 
  className = '',
  onClick,
  hover = true
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white card-oasis p-6
        ${hover ? 'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,102,153,0.15)] cursor-pointer' : ''}
        transition-all duration-200 ease-out
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Oasis Button - Enhanced with more variants and better states
export function OasisButton({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  size = 'md',
  disabled = false,
  fullWidth = false
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'blue'; 
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const baseClass = `capsule font-inter font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0E8C5E]/30 focus-visible:outline-none`
  const sizeClass = size === 'sm' ? 'px-4 py-2 text-xs gap-1.5' : size === 'md' ? 'px-6 py-2.5 text-sm gap-2' : 'px-8 py-3 text-base gap-2'
  const widthClass = fullWidth ? 'w-full' : ''
  const variantClasses: Record<string, string> = {
    primary: 'oasis-gradient text-white hover:shadow-lg shadow-md hover:brightness-110',
    secondary: 'bg-[#E8F5EE] text-[#0E8C5E] hover:bg-[#D0EDDC] shadow-sm',
    outline: 'border-2 border-[#0E8C5E] text-[#0E8C5E] hover:bg-[#E8F5EE] hover:shadow-md',
    ghost: 'text-[#0E8C5E] hover:bg-[#E8F5EE]/70',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-md hover:shadow-lg',
    success: 'bg-[#0E8C5E] text-white hover:bg-[#0A6B45] shadow-md hover:shadow-lg',
    blue: 'bg-[#0077B6] text-white hover:bg-[#005F92] shadow-md hover:shadow-lg',
  }
  const variantClass = variantClasses[variant] || variantClasses.primary

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${sizeClass} ${variantClass} ${widthClass} inline-flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  )
}

// Icon Button - For toolbars and compact actions
export function OasisIconButton({ 
  onClick, 
  icon, 
  variant = 'ghost', 
  size = 'md',
  label,
  disabled = false,
  className = ''
}: { 
  onClick?: () => void; 
  icon: React.ReactNode; 
  variant?: 'ghost' | 'outline' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
  const variantClasses: Record<string, string> = {
    ghost: 'text-[#8A8A8A] hover:text-[#0E8C5E] hover:bg-[#E8F5EE]/50',
    outline: 'border-2 border-[#E0E0E0] text-[#8A8A8A] hover:border-[#0E8C5E] hover:text-[#0E8C5E] hover:bg-[#E8F5EE]/50',
    danger: 'text-[#8A8A8A] hover:text-[#EF4444] hover:bg-[#FEE2E2]',
    primary: 'oasis-gradient text-white shadow-sm hover:shadow-md',
  }
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {icon}
    </button>
  )
}

// Oasis Input
export function OasisInput({ 
  label,
  icon,
  error,
  className = '',
  ...props 
}: { 
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="font-inter font-medium text-sm text-[#4A4A4A]">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5
            font-inter text-sm text-[#4A4A4A]
            focus:border-[#0E8C5E] focus:ring-2 focus:ring-[#0E8C5E]/20 focus:outline-none
            placeholder:text-[#B0B0B0]
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-[#F4A261] focus:border-[#F4A261]' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#F4A261] font-inter">{error}</p>}
    </div>
  )
}

// Section divider with wave SVG
export function WaveDivider({ color = '#E8F5EE', flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

// Star rating display
export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={star <= rating ? '#0E8C5E' : '#E0E0E0'}
        >
          <path d="M10 1L12.39 6.26L18.18 7.27L14.09 11.47L15.18 17.18L10 14.27L4.82 17.18L5.91 11.47L1.82 7.27L7.61 6.26L10 1Z" />
        </svg>
      ))}
    </div>
  )
}

// Status badge
export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'emergency' }) {
  const styles = {
    active: 'bg-[#E8F5EE] text-[#0E8C5E]',
    inactive: 'bg-[#E0E0E0] text-[#8A8A8A]',
    pending: 'bg-[#FFF3E0] text-[#F4A261]',
    completed: 'bg-[#E8F5EE] text-[#0E8C5E]',
    cancelled: 'bg-[#FEE2E2] text-[#EF4444]',
    emergency: 'bg-[#FFF3E0] text-[#F4A261]',
  }
  const labels = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    emergency: 'Emergencia',
  }
  return (
    <span className={`capsule px-3 py-1 text-xs font-inter font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
