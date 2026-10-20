'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { FileText, Search } from 'lucide-react'

type Tab = 'DEMANDE' | 'EN_COURS' | 'TRAITÉ' | 'REJETÉ'

const TAB_LABELS: Record<Tab, string> = {
  DEMANDE: 'Nouvelles',
  EN_COURS: 'En cours',
  TRAITÉ: 'Traitées',
  REJETÉ: 'Rejetées'
}

const TABS: Tab[] = ['DEMANDE', 'EN_COURS', 'TRAITÉ', 'REJETÉ']

export default function QuotesPage() {
  const [tab, setTab] = useState<Tab>('DEMANDE')
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<any>(null)

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const res = await fetch('http://localhost:5001/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const devis = json.data.filter((d: any) => d.type === 'DEVIS')
          setQuotes(devis)
        }
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuote = async (id: string, statut: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/documents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut })
      });
      if (res.ok) {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, statut } : q));
        if (selectedQuote && selectedQuote.id === id) {
           setSelectedQuote({ ...selectedQuote, statut });
        }
      }
    } catch (err) {
      console.error("Erreur réseau update quote", err);
    }
  }

  const openManageModal = (quote: any) => {
    setSelectedQuote(quote);
    setIsManageModalOpen(true);
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const filtered = quotes.filter(q => q.statut === tab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher par n° de devis..." actionLabel="Nouveau" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Demandes de Devis</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérer et traiter les demandes reçues de l'application mobile.</p>
          </div>

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
                {TAB_LABELS[t]} ({quotes.filter(q => q.statut === t).length})
              </button>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Chargement des devis...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8E2', backgroundColor: '#F8F9FA' }}>
                  {['NUMÉRO', 'CLIENT', 'DATE', 'STATUT', 'ACTION'].map(h => (
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
                      Aucun devis dans cette catégorie
                    </td>
                  </tr>
                ) : filtered.map((quote) => {
                  return (
                    <tr
                      key={quote.id}
                      style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="#1B4332" />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{quote.numeroDocument}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{quote.user?.name || 'Inconnu'}</p>
                        <p style={{ fontSize: '11px', color: '#6B7280' }}>{quote.user?.email}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', backgroundColor: quote.statut === 'DEMANDE' ? '#E0F2FE' : quote.statut === 'EN_COURS' ? '#FEF9C3' : quote.statut === 'TRAITÉ' ? '#DCFCE7' : '#FEE2E2', color: quote.statut === 'DEMANDE' ? '#0284C7' : quote.statut === 'EN_COURS' ? '#CA8A04' : quote.statut === 'TRAITÉ' ? '#16A34A' : '#DC2626' }}>
                          {quote.statut}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button 
                          onClick={() => openManageModal(quote)}
                          style={{
                            height: '30px', padding: '0 12px',
                            backgroundColor: '#1B4332', color: '#fff',
                            fontSize: '11px', fontWeight: 700,
                            borderRadius: '7px', border: 'none', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                          Ouvrir
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isManageModalOpen && selectedQuote && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Demande {selectedQuote.numeroDocument}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '4px' }}><strong>Client :</strong> {selectedQuote.user?.name} ({selectedQuote.user?.email})</p>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '4px' }}><strong>Reçue le :</strong> {new Date(selectedQuote.createdAt).toLocaleString()}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>STATUT</label>
                <select 
                  value={selectedQuote.statut}
                  onChange={(e) => handleUpdateQuote(selectedQuote.id, e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                >
                  <option value="DEMANDE">Nouveau</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TRAITÉ">Traité</option>
                  <option value="REJETÉ">Rejeté</option>
                </select>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>La mise à jour se fait automatiquement à la sélection.</p>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DÉTAIL DE LA DEMANDE</label>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', maxHeight: '200px', overflowY: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#374151', fontFamily: 'inherit', margin: 0 }}>
                    {selectedQuote.notes}
                  </pre>
                </div>
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
