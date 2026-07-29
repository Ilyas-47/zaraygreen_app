// src/app/(dashboard)/products/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function ProductsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<string>('Tous les produits')
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // New Category state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  // New / Edit Product state
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [newProductName, setNewProductName] = useState('')
  const [newProductDesc, setNewProductDesc] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('0')
  const [newProductStock, setNewProductStock] = useState('0')
  const [newProductCategoryId, setNewProductCategoryId] = useState('')
  const [newProductImage, setNewProductImage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch categories
      const catRes = await fetch('http://localhost:5001/api/categories', { headers })
      if (catRes.status === 401) return handleUnauthorized()
      
      let cats = []
      if (catRes.ok) {
        const catJson = await catRes.json()
        cats = catJson.data || []
        setCategories(cats)
      }

      // Fetch products
      const prodRes = await fetch('http://localhost:5001/api/products', { headers })
      if (prodRes.ok) {
        const prodJson = await prodRes.json()
        setProducts(prodJson.data || [])
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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return alert('Le nom de la catégorie est requis.')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryName, description: newCategoryDesc })
      })
      if (res.status === 401) return handleUnauthorized()
      
      const json = await res.json()
      if (res.ok && json.success) {
        setCategories(prev => [json.data, ...prev])
        setNewCategoryName('')
        setNewCategoryDesc('')
        setIsCategoryModalOpen(false)
      } else {
        alert('Erreur: ' + (json.message || 'Impossible d\'ajouter la catégorie.'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    }
  }

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductCategoryId) {
      return alert('Le nom et la catégorie sont requis.')
    }

    try {
      const token = localStorage.getItem('token')
      const method = editingProductId ? 'PUT' : 'POST'
      const url = editingProductId 
        ? `http://localhost:5001/api/products/${editingProductId}`
        : 'http://localhost:5001/api/products'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newProductName,
          description: newProductDesc || 'Pas de description',
          price: parseFloat(newProductPrice || '0'),
          stock: parseInt(newProductStock || '0'),
          categoryId: newProductCategoryId,
          images: newProductImage ? [newProductImage] : []
        })
      })
      if (res.status === 401) return handleUnauthorized()
      
      const json = await res.json()
      if (res.ok && json.success) {
        if (editingProductId) {
          setProducts(prev => prev.map(p => p.id === editingProductId ? json.data : p))
        } else {
          setProducts(prev => [json.data, ...prev])
        }
        resetProductForm()
      } else {
        alert('Erreur: ' + (json.message || 'Impossible d\'enregistrer le produit.'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    }
  }

  const resetProductForm = () => {
    setEditingProductId(null)
    setNewProductName('')
    setNewProductDesc('')
    setNewProductPrice('0')
    setNewProductStock('0')
    setNewProductCategoryId('')
    setNewProductImage('')
    setIsProductModalOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProductImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openEditModal = (p: any) => {
    setEditingProductId(p.id)
    setNewProductName(p.name)
    setNewProductDesc(p.description)
    setNewProductPrice(p.price.toString())
    setNewProductStock(p.stock.toString())
    setNewProductCategoryId(p.categoryId)
    setNewProductImage(p.images && p.images.length > 0 ? p.images[0] : '')
    setIsProductModalOpen(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401) return handleUnauthorized()
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const updateStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ stock: newStock })
      })
      if (res.status === 401) return handleUnauthorized()
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
      }
    } catch (err) {
      console.error('Erreur mise à jour stock:', err)
    }
  }

  // Filtrage des produits par catégorie
  const filteredProducts = tab === 'Tous les produits' 
    ? products 
    : products.filter(p => p.category?.name === tab)

  const TABS = ['Tous les produits', ...Array.from(new Set(categories.map(c => c.name)))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher des produits ou des projets..." actionLabel="Nouveau Produit" onAction={() => { resetProductForm(); setIsProductModalOpen(true) }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Title + Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Inventaire & Collections</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérez vos plantes, matériaux et l'inventaire complet de Zaray Green.</p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>PRODUITS ACTIFS</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>{products.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>CATÉGORIES</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>{categories.length}</p>
            </div>
          </div>
        </div>

        {/* Table & Tabs */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
          
          {/* Filters + Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8E2', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>FILTRER PAR CATÉGORIE :</label>
              <select 
                value={tab} 
                onChange={e => setTab(e.target.value)}
                style={{ height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #E2E8E2', outline: 'none', backgroundColor: '#F9FAFB', color: '#1A1A1A', minWidth: '200px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                {TABS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                style={{ height: '36px', padding: '0 16px', backgroundColor: '#fff', color: '#1B4332', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid #1B4332', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1B4332'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#1B4332' }}
              >
                + Nouvelle Catégorie
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F4F6F4' }}>
                {['PRODUIT', 'CATÉGORIE', 'STOCK', 'PRIX', 'STATUT', 'ACTIONS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Chargement...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Aucun produit trouvé</td></tr>
              ) : filteredProducts.map((p, i) => {
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock <= 5;
                const status = isOutOfStock ? 'RUPTURE' : (isLowStock ? 'STOCK FAIBLE' : 'EN STOCK');
                const statusColor = isOutOfStock ? '#EF4444' : (isLowStock ? '#F59E0B' : '#22C55E');
                const statusBg = isOutOfStock ? '#FEF2F2' : (isLowStock ? '#FFFBEB' : '#F0FDF4');

                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F4F6F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, overflow: 'hidden' }}>
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : '🌿'}
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{p.name}</p>
                          <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{p.description ? p.description.substring(0, 30) + '...' : 'Pas de description'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1B4332', backgroundColor: '#E8F5E9', padding: '3px 10px', borderRadius: '20px' }}>
                        {p.category?.name || 'Inconnu'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                      {p.price.toFixed(2)} MAD
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: statusBg, color: statusColor }}>
                        ● {status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button onClick={() => openEditModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#1B4332'} onMouseLeave={e => e.currentTarget.style.color = '#6B7280'} title="Modifier">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', transition: 'color 0.15s', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'} title="Supprimer">
                          <Trash2 size={16} />
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

      {/* --- MODAL CATEGORY --- */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '400px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Nouvelle Catégorie</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOM</label>
                <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: Plantes d'intérieur" />
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

      {/* --- MODAL PRODUCT --- */}
      {isProductModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>{editingProductId ? 'Modifier le Produit' : 'Nouveau Produit'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOM DU PRODUIT</label>
                <input value={newProductName} onChange={e => setNewProductName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: Ficus Lyrata" />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>CATÉGORIE</label>
                <select value={newProductCategoryId} onChange={e => setNewProductCategoryId(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="" disabled>Sélectionner une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>PRIX (MAD)</label>
                  <input type="number" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>STOCK INITIAL</label>
                  <input type="number" value={newProductStock} onChange={e => setNewProductStock(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>IMAGE DU PRODUIT</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {newProductImage && (
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #D1D5DB' }}>
                      <img src={newProductImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#F9FAFB' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                <textarea value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} style={{ width: '100%', height: '80px', padding: '12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', resize: 'none' }} placeholder="Courte description..." />
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={resetProductForm} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#374151', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddProduct} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{editingProductId ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}