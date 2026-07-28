// src/app/(dashboard)/orders/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { ShoppingBag, MapPin, Truck, FileText, Package } from 'lucide-react'

type Tab = 'PENDING' | 'CONFIRMED' | 'EN_COURS' | 'DELIVERED'

const TAB_LABELS: Record<Tab, string> = {
  PENDING: 'Nouvelles',
  CONFIRMED: 'Confirmées',
  EN_COURS: 'En cours',
  DELIVERED: 'Livrées'
}

const TABS: Tab[] = ['PENDING', 'CONFIRMED', 'EN_COURS', 'DELIVERED']

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('PENDING')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [livreurs, setLivreurs] = useState<any[]>([])

  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [docMessage, setDocMessage] = useState('')

  const fetchOrdersAndLivreurs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch Orders
      const res = await fetch('http://localhost:5001/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) setOrders(json.data)
      }

      // Fetch Livreurs
      const usersRes = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (usersRes.ok) {
        const uJson = await usersRes.json()
        if (uJson.success && uJson.data) {
          const onlyLivreurs = uJson.data.filter((u: any) => u.role?.toLowerCase() === 'livreur')
          setLivreurs(onlyLivreurs)
        }
      }

    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrder = async (id: string, updates: { status?: string, livreurId?: string }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedOrderRes = await res.json();
        const updatedOrder = updatedOrderRes.data;
        
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates, livreurId: updates.livreurId !== undefined ? updates.livreurId : o.livreurId } : o));
        
        if (selectedOrder && selectedOrder.id === id) {
           setSelectedOrder({ ...selectedOrder, ...updates, livreurId: updates.livreurId !== undefined ? updates.livreurId : selectedOrder.livreurId });
        }
      }
    } catch (err) {
      console.error("Erreur réseau update order", err);
    }
  }

  const openManageModal = (order: any) => {
    setSelectedOrder(order);
    setDocMessage('');
    setIsManageModalOpen(true);
  }

  const handleGenerateDocument = (type: string) => {
    if (!selectedOrder) return;
    
    // Create a new window for printing the document
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${type} - Commande #${selectedOrder.id.slice(0, 8).toUpperCase()}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #1B4332; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #1B4332; margin: 0; }
              .details { margin-bottom: 40px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f8f9fa; }
              .total { text-align: right; font-size: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ZARAY GREEN</h1>
              <p>${type}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="details">
              <h3>Client: ${selectedOrder.user?.name || 'Inconnu'}</h3>
              <p>Email: ${selectedOrder.user?.email || '-'}</p>
              <p>Téléphone: ${selectedOrder.user?.phone || '-'}</p>
              <br/>
              <h3>Référence Commande: #${selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix Unitaire</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${selectedOrder.items?.map((item: any) => `
                  <tr>
                    <td>${item.product?.name || 'Produit'}</td>
                    <td>${item.price.toFixed(2)} MAD</td>
                    <td>${item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)} MAD</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
            <div class="total">
              TOTAL: ${selectedOrder.totalAmount.toFixed(2)} MAD
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // setTimeout to allow rendering before print dialog opens
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  useEffect(() => {
    fetchOrdersAndLivreurs()
  }, [])

  const filtered = orders.filter(o => o.status === tab)

  // Calcule la charge du jour
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length
  const enCoursCount = orders.filter(o => o.status === 'EN_COURS').length
  const totalActive = pendingCount + confirmedCount + enCoursCount
  const capacityPct = totalActive > 0 ? Math.min(Math.round(((confirmedCount + enCoursCount) / totalActive) * 100), 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher par ID ou client..." actionLabel="Ajouter" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Title + Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Logistique des Commandes</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Suivre et coordonner le cycle de livraison des produits.</p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', backgroundColor: '#F4F6F4', border: '1px solid #E2E8E2', borderRadius: '10px', padding: '4px', gap: '2px' }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '6px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  backgroundColor: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#1B4332' : '#6B7280',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

          {/* Orders Table */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
                Chargement des commandes...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8E2' }}>
                    {['RÉFÉRENCE', 'CLIENT', 'TOTAL', 'PRODUITS', 'ACTION'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
                        Aucune commande dans cette catégorie
                      </td>
                    </tr>
                  ) : filtered.map((order, i) => {
                    const initials = order.user?.name ? order.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                    const itemsCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                    return (
                      <tr
                        key={order.id}
                        style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Order ID */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#374151' }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        {/* Client */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{order.user?.name || 'Utilisateur inconnu'}</p>
                              <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{order.user?.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>
                            {order.totalAmount.toLocaleString()} MAD
                          </span>
                        </td>

                        {/* Items count */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#F4F6F4', border: '1px solid #E2E8E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                              🌿
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                              {itemsCount} article(s)
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td style={{ padding: '14px 16px' }}>
                          <button 
                            onClick={() => openManageModal(order)}
                            style={{
                              height: '30px', padding: '0 12px',
                              backgroundColor: '#1B4332', color: '#fff',
                              fontSize: '11px', fontWeight: 700,
                              borderRadius: '7px', border: 'none', cursor: 'pointer',
                              fontFamily: 'Inter, sans-serif',
                          }}>
                            {tab === 'DELIVERED' ? 'Détails' : 'Gérer'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Delivery Load */}
            <div style={{ backgroundColor: '#1B4332', borderRadius: '12px', padding: '20px', color: '#fff' }}>
              <p style={{ fontSize: '10px', color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '12px' }}>
                Charge logistique
              </p>
              <p style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>{totalActive}</p>
              <p style={{ fontSize: '12px', color: '#86EFAC', lineHeight: '1.5', marginBottom: '16px' }}>
                Commandes actives en attente de livraison ou de traitement.
              </p>

              {/* Capacity bar */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '10px', color: '#86EFAC', marginBottom: '8px' }}>{capacityPct}% de capacité confirmée</p>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${capacityPct}%`, backgroundColor: '#52B788', borderRadius: '3px' }} />
                </div>
              </div>
            </div>

            {/* Active Personnel */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', padding: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', marginBottom: '14px' }}>Livreurs Disponibles</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'En livraison', count: confirmedCount, color: '#22C55E' },
                  { label: 'Au Hub', count: pendingCount, color: '#F59E0B' },
                  { label: 'Hors service', count: 0, color: '#EF4444' }
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
                      <span style={{ fontSize: '12px', color: '#374151' }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MANAGE MODAL */}
      {isManageModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Gérer la Commande #{selectedOrder.id.slice(0, 8).toUpperCase()}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '4px' }}><strong>Client :</strong> {selectedOrder.user?.name}</p>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '4px' }}><strong>Total :</strong> {selectedOrder.totalAmount} MAD</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>STATUT</label>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrder(selectedOrder.id, { status: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                >
                  <option value="PENDING">Nouvelle</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="DELIVERED">Livrée</option>
                </select>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>La mise à jour se fait automatiquement à la sélection.</p>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>ASSIGNER UN LIVREUR</label>
                <select 
                  value={selectedOrder.livreurId || ''}
                  onChange={(e) => {
                    const livreurId = e.target.value || undefined;
                    handleUpdateOrder(selectedOrder.id, { 
                      livreurId,
                      ...(livreurId ? { status: 'EN_COURS' } : {})
                    });
                  }}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                >
                  <option value="">-- Sélectionner un livreur --</option>
                  {livreurs.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DOCUMENTS</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleGenerateDocument('Devis')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '40px', backgroundColor: '#F3F4F6', color: '#1F2937', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>
                    <FileText size={16} /> Générer Devis
                  </button>
                  <button onClick={() => handleGenerateDocument('Bon de Livraison')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '40px', backgroundColor: '#F3F4F6', color: '#1F2937', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>
                    <Package size={16} /> Générer BL
                  </button>
                </div>
                {docMessage && <p style={{ fontSize: '12px', color: '#22C55E', marginTop: '8px', fontWeight: 600 }}>{docMessage}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsManageModalOpen(false)} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}