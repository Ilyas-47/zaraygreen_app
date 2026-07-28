// src/components/layout/Header.tsx
'use client'
import { useState } from 'react'

interface HeaderProps {
  searchPlaceholder?: string
  actionLabel?:       string
  onAction?:          () => void
}

export default function Header({ searchPlaceholder = 'Search...', actionLabel = 'Add Entry', onAction }: HeaderProps) {
  const [query, setQuery] = useState('')

  return (
    <header style={{
      height: '56px', backgroundColor: '#fff',
      borderBottom: '1px solid #E2E8E2',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '12px',
      position: 'sticky', top: 0, zIndex: 30,
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Search */}
      <div style={{ position: 'relative', width: '260px' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            width: '100%', height: '32px',
            paddingLeft: '32px', paddingRight: '12px',
            fontSize: '12px', color: '#1A1A1A',
            backgroundColor: '#F4F6F4',
            border: '1px solid #E2E8E2',
            borderRadius: '8px', outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>

      {/* Action */}
      <button
        onClick={onAction}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          height: '32px', padding: '0 14px',
          backgroundColor: '#1B4332', color: '#fff',
          fontSize: '12px', fontWeight: 600,
          borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        + {actionLabel}
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />



      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid #E2E8E2' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
          ZA
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>Zaray Admin</p>
          <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>Administrator</p>
        </div>
        <span style={{ color: '#9CA3AF', fontSize: '10px' }}>▾</span>
      </div>

    </header>
  )
}