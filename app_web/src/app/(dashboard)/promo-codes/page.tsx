'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function PromoCodesPage() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Promo Code state
  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState('0')
  const [newValidUntil, setNewValidUntil] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const res = await fetch('http://localhost:5001/api/promo', { headers })
      if (res.status === 401) return handleUnauthorized()
      
      if (res.ok) {
        const json = await res.json()
        setPromoCodes(json.data || [])
      }
    } catch (err) {
      console.error('Erreur chargement données:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnauthorized = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const handleAddPromoCode = async () => {
    if (!newCode.trim() || !newDiscount) return alert('Le code et la réduction sont requis.')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          code: newCode, 
          discountPercentage: parseFloat(newDiscount),
          validUntil: newValidUntil ? new Date(newValidUntil).toISOString() : undefined
        })
      })
      if (res.status === 401) return handleUnauthorized()
      
      const json = await res.json()
      if (res.ok && json.success) {
        setPromoCodes(prev => [json.data, ...prev])
        resetForm()
      } else {
        alert('Erreur: ' + (json.message || 'Impossible d\'ajouter le code.'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    }
  }

  const resetForm = () => {
    setNewCode('')
    setNewDiscount('0')
    setNewValidUntil('')
    setIsModalOpen(false)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5001/api/promo/${id}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (res.status === 401) return handleUnauthorized()
      if (res.ok) {
        setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !isActive } : p))
      }
    } catch (err) {
      console.error('Erreur mise à jour:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher des codes promo..." actionLabel="Nouveau Code Promo" onAction={() => setIsModalOpen(true)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Title + Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Codes Promotionnels</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérez les réductions applicables dans l'application mobile.</p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>CODES TOTAL</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>{promoCodes.length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F4F6F4' }}>
                {['CODE', 'RÉDUCTION', 'VALIDITÉ', 'STATUT', 'ACTIONS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Chargement...</td></tr>
              ) : promoCodes.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Aucun code promo trouvé</td></tr>
              ) : promoCodes.map((p) => {
                const isExpired = p.validUntil ? new Date(p.validUntil) < new Date() : false;
                const statusColor = !p.isActive ? '#6B7280' : isExpired ? '#EF4444' : '#22C55E';
                const statusBg = !p.isActive ? '#F3F4F6' : isExpired ? '#FEF2F2' : '#F0FDF4';
                const statusText = !p.isActive ? 'Désactivé' : isExpired ? 'Expiré' : 'Actif';

                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                      {p.code}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                      -{p.discountPercentage}%
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280' }}>
                      {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : 'Illimité'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: statusBg, color: statusColor }}>
                        ● {statusText}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button onClick={() => toggleActive(p.id, p.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.isActive ? '#EF4444' : '#22C55E', display: 'flex', alignItems: 'center' }} title={p.isActive ? 'Désactiver' : 'Activer'}>
                          {p.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '400px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Nouveau Code Promo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>CODE</label>
                <input value={newCode} onChange={e => setNewCode(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', textTransform: 'uppercase' }} placeholder="Ex: EID20" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>RÉDUCTION (%)</label>
                <input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: 20" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DATE D'EXPIRATION (Optionnel)</label>
                <input type="date" value={newValidUntil} onChange={e => setNewValidUntil(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={resetForm} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#374151', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddPromoCode} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
