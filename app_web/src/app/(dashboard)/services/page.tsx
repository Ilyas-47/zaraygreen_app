// src/app/(dashboard)/services/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // Form state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('0')
  const [newServiceImage, setNewServiceImage] = useState('')
  const [newServiceCategory, setNewServiceCategory] = useState('')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const res = await fetch('http://localhost:5001/api/services', { headers })
      const catRes = await fetch('http://localhost:5001/api/service-categories', { headers })
      
      if (res.status === 401) return handleUnauthorized()
      
      if (res.ok) {
        const json = await res.json()
        setServices(json.data || [])
      }
      if (catRes.ok) {
        const json = await catRes.json()
        setCategories(json.data || [])
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

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      return alert('Le nom du service est requis.')
    }

    try {
      const token = localStorage.getItem('token')
      const method = editingServiceId ? 'PUT' : 'POST'
      const url = editingServiceId 
        ? `http://localhost:5001/api/services/${editingServiceId}`
        : 'http://localhost:5001/api/services'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newServiceName,
          description: newServiceDesc || 'Pas de description',
          basePrice: parseFloat(newServicePrice || '0'),
          image: newServiceImage || '',
          categoryId: newServiceCategory || null
        })
      })
      
      if (res.status === 401) return handleUnauthorized()
      
      const json = await res.json()
      if (res.ok && json.success) {
        if (editingServiceId) {
          setServices(prev => prev.map(s => s.id === editingServiceId ? json.data : s))
        } else {
          setServices(prev => [json.data, ...prev])
        }
        resetForm()
      } else {
        alert('Erreur: ' + (json.message || 'Impossible d\'enregistrer le service.'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    }
  }

  const resetForm = () => {
    setEditingServiceId(null)
    setNewServiceName('')
    setNewServiceDesc('')
    setNewServicePrice('0')
    setNewServiceImage('')
    setNewServiceCategory('')
    setIsServiceModalOpen(false)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return alert('Le nom est requis')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/service-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryName, description: newCategoryDesc })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setCategories([json.data, ...categories])
        setNewCategoryName('')
        setNewCategoryDesc('')
        setIsCategoryModalOpen(false)
      } else {
        alert(json.message)
      }
    } catch (err) { console.error(err) }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewServiceImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openEditModal = (s: any) => {
    setEditingServiceId(s.id)
    setNewServiceName(s.name)
    setNewServiceDesc(s.description)
    setNewServicePrice(s.basePrice?.toString() || '0')
    setNewServiceImage(s.image || '')
    setNewServiceCategory(s.categoryId || '')
    setIsServiceModalOpen(true)
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce service ?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5001/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401) return handleUnauthorized()
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id))
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher des services..." actionLabel="Nouveau Service" onAction={() => { resetForm(); setIsServiceModalOpen(true) }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Services Professionnels</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérez les prestations et services offerts par Zaray Green.</p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>SERVICES ACTIFS</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>{services.length}</p>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                backgroundColor: activeCategory === 'all' ? '#1B4332' : '#fff',
                color: activeCategory === 'all' ? '#fff' : '#4B5563',
                border: activeCategory === 'all' ? '1px solid #1B4332' : '1px solid #D1D5DB'
              }}
            >
              Tous
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  backgroundColor: activeCategory === c.id ? '#1B4332' : '#fff',
                  color: activeCategory === c.id ? '#fff' : '#4B5563',
                  border: activeCategory === c.id ? '1px solid #1B4332' : '1px solid #D1D5DB'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#1B4332', backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Ajouter Catégorie
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8E2', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Liste des Services</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F4F6F4' }}>
                {['SERVICE', 'DESCRIPTION', 'PRIX DE BASE', 'ACTIONS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Chargement...</td></tr>
              ) : services.filter(s => activeCategory === 'all' || s.categoryId === activeCategory).length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Aucun service trouvé</td></tr>
              ) : services.filter(s => activeCategory === 'all' || s.categoryId === activeCategory).map((s) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F4F6F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, overflow: 'hidden' }}>
                        {s.image ? (
                          <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : '🔧'}
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{s.name}</p>
                        {s.category && <span style={{ fontSize: '10px', color: '#1B4332', backgroundColor: '#E8F5E9', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{s.category.name}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <p style={{ fontSize: '11px', color: '#6B7280' }}>{s.description ? s.description.substring(0, 50) + '...' : 'Pas de description'}</p>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                    {s.basePrice ? s.basePrice.toFixed(2) + ' MAD' : 'Sur devis'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <button onClick={() => openEditModal(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#1B4332'} onMouseLeave={e => e.currentTarget.style.color = '#6B7280'} title="Modifier">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteService(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', transition: 'color 0.15s', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL SERVICE --- */}
      {isServiceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>{editingServiceId ? 'Modifier le Service' : 'Nouveau Service'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOM DU SERVICE</label>
                <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: Entretien de Jardin" />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>CATÉGORIE</label>
                <select value={newServiceCategory} onChange={e => setNewServiceCategory(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="">Aucune</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>PRIX DE BASE (MAD)</label>
                <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="0 pour sur devis" />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>IMAGE DU SERVICE</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {newServiceImage && (
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #D1D5DB' }}>
                      <img src={newServiceImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#F9FAFB' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                <textarea value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} style={{ width: '100%', height: '80px', padding: '12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', resize: 'none' }} placeholder="Détails de la prestation..." />
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={resetForm} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#374151', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddService} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{editingServiceId ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CATEGORY --- */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '400px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Nouvelle Catégorie</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOM DE LA CATÉGORIE</label>
                <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: Premium" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                <input value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Optionnel" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#374151', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddCategory} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Créer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
