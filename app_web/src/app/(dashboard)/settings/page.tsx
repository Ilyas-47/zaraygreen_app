// src/app/(dashboard)/settings/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Settings, ShieldCheck } from 'lucide-react'

type SettingTab = 'Général' | 'Sécurité'

const SETTING_TABS: SettingTab[] = ['Général', 'Sécurité']

export default function SettingsPage() {
  const [tab, setTab]               = useState<SettingTab>('Général')
  const [name, setName]             = useState('Zaray Admin')
  const [email, setEmail]           = useState('admin@zaraygreen.com')
  const [phone, setPhone]           = useState('+212 6 00 00 00 00')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        if (u.name || u.fullName) setName(u.fullName || u.name)
        if (u.email) setEmail(u.email)
        if (u.phone) setPhone(u.phone)
      } catch (e) {}
    }
  }, [])

  const [oldPass, setOldPass]       = useState('')
  const [newPass, setNewPass]       = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saved, setSaved]           = useState(false)

  const [notifs, setNotifs] = useState({
    newOrder:     true,
    lowStock:     true,
    newUser:      false,
    deliveryDone: true,
    taskAssigned: true,
    weeklyReport: false,
  })

  const [theme, setTheme]     = useState<'light' | 'dark'>('light')
  const [compact, setCompact] = useState(false)
  const [sidebarColor, setSidebarColor] = useState('#1B4332')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = {
    width: '100%', height: '40px',
    padding: '0 12px', fontSize: '13px',
    color: '#1A1A1A', backgroundColor: '#F9FBF9',
    border: '1px solid #E2E8E2', borderRadius: '8px',
    outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '12px', fontWeight: 600,
    color: '#374151', marginBottom: '6px',
    display: 'block' as const,
  }

  const sectionTitleStyle = {
    fontSize: '14px', fontWeight: 700,
    color: '#1A1A1A', marginBottom: '4px',
  }

  const sectionSubStyle = {
    fontSize: '12px', color: '#6B7280', marginBottom: '20px',
  }

  const toggleStyle = (active: boolean) => ({
    width: '40px', height: '22px', borderRadius: '11px',
    backgroundColor: active ? '#1B4332' : '#D1D5DB',
    position: 'relative' as const,
    cursor: 'pointer', border: 'none',
    transition: 'background 0.2s', flexShrink: 0,
  })

  const toggleDotStyle = (active: boolean) => ({
    position: 'absolute' as const,
    top: '3px',
    left: active ? '20px' : '3px',
    width: '16px', height: '16px',
    borderRadius: '50%', backgroundColor: '#fff',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher dans les paramètres..." actionLabel="Sauvegarder" onAction={handleSave} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Paramètres</h1>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérez vos préférences et la configuration de la plateforme.</p>
        </div>

        {/* Saved toast */}
        {saved && (
          <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 100, backgroundColor: '#1B4332', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ Modifications sauvegardées !
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Left Nav */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
            {SETTING_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  width: '100%', padding: '12px 16px',
                  textAlign: 'left', fontSize: '13px', fontWeight: 500,
                  border: 'none', borderLeft: `3px solid ${tab === t ? '#1B4332' : 'transparent'}`,
                  backgroundColor: tab === t ? '#F0FDF4' : 'transparent',
                  color: tab === t ? '#1B4332' : '#6B7280',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t === 'Général' ? <Settings size={18} /> : <ShieldCheck size={18} />}
                </span>
                {t}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', padding: '28px' }}>

            {/* ── GÉNÉRAL ── */}
            {tab === 'Général' && (
              <div>
                <p style={sectionTitleStyle}>Informations du compte</p>
                <p style={sectionSubStyle}>Mettez à jour vos informations personnelles et professionnelles.</p>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#F9FBF9', borderRadius: '10px', border: '1px solid #E2E8E2' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
                    ZA
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Photo de profil</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>JPG, PNG ou GIF — max 2MB</p>
                    <button style={{ height: '28px', padding: '0 12px', fontSize: '11px', fontWeight: 600, color: '#1B4332', backgroundColor: '#fff', border: '1px solid #1B4332', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Changer la photo
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nom complet</label>
                    <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Adresse email</label>
                    <input style={{ ...inputStyle, backgroundColor: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed' }} value={email} readOnly type="email" />
                  </div>
                  <div>
                    <label style={labelStyle}>Téléphone</label>
                    <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Rôle</label>
                  <input style={{ ...inputStyle, backgroundColor: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed' }} value="Administrateur" readOnly />
                </div>

              </div>
            )}

            {/* ── SÉCURITÉ ── */}
            {tab === 'Sécurité' && (
              <div>
                <p style={sectionTitleStyle}>Mot de passe</p>
                <p style={sectionSubStyle}>Changez votre mot de passe régulièrement pour sécuriser votre compte.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px', marginBottom: '28px' }}>
                  <div>
                    <label style={labelStyle}>Mot de passe actuel</label>
                    <input style={inputStyle} type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={labelStyle}>Nouveau mot de passe</label>
                    <input style={inputStyle} type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmer le mot de passe</label>
                    <input style={inputStyle} type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <button style={{ height: '38px', padding: '0 20px', alignSelf: 'flex-start', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Mettre à jour
                  </button>
                </div>
              </div>
            )}

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8E2' }}>
              <button
                onClick={handleSave}
                style={{ height: '38px', padding: '0 24px', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Sauvegarder les modifications
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}