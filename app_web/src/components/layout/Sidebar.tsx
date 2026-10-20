// src/components/layout/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {LayoutDashboard,ShoppingCart,Archive,Package,Users,Settings,LogOut, Wrench, Ticket, CalendarDays, FileText, HelpCircle} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/appointments', label: 'Réservations', icon: CalendarDays },
  { href: '/archives', label: 'Archives', icon: Archive },
  { href: '/products', label: 'Produits', icon: Package },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/quotes', label: 'Devis', icon: FileText },
  { href: '/support', label: 'Support', icon: HelpCircle },
  { href: '/customers', label: 'Clients', icon: Users },
  { href: '/promo-codes', label: 'Code Promo', icon: Ticket },
];

export default function Sidebar() {
  const path = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      height: '100vh', width: '220px',
      backgroundColor: '#fff',
      borderRight: '1px solid #E2E8E2',
      display: 'flex', flexDirection: 'column',
      zIndex: 40, fontFamily: 'Inter, sans-serif',
    }}>

      {/* Brand */}
      <div style={{ padding: '20px', borderBottom: '1px solid #E2E8E2' }}>
        <p style={{ color: '#1B4332', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em' }}>ZARAY GREEN</p>
        <p style={{ color: '#9CA3AF', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>Admin Management</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {NAV.map(item => {
  const active = path === item.href || path.startsWith(item.href + '/')
  const Icon = item.icon

  return (
    <Link
      key={item.href}
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        backgroundColor: active ? '#1B4332' : 'transparent',
        color: active ? '#fff' : '#6B7280',
      }}
    >
      <Icon size={16} />
      {item.label}
    </Link>
  )
})}
      </nav>

      {/* Bottom */}
      {/* Bottom */}
<div
  style={{
    padding: '12px',
    borderTop: '1px solid #E2E8E2',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }}
>
  <Link
    href="/settings"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500,
      color: '#6B7280',
      textDecoration: 'none',
    }}
  >
    <Settings size={16} />
    Paramètres
  </Link>

  <button
    onClick={handleLogout}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500,
      color: '#EF4444',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
    }}
  >
    <LogOut size={16} />
    Se déconnecter
  </button>
</div>
    </aside>
  )
}