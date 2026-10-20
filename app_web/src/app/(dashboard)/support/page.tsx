'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { HelpCircle, Mail, Clock, CheckCircle } from 'lucide-react'

type Tab = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

const TAB_LABELS: Record<Tab, string> = {
  OPEN: 'Nouveaux',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolus',
}

const TABS: Tab[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED']

export default function SupportPage() {
  const [tab, setTab] = useState<Tab>('OPEN')
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const res = await fetch('http://localhost:5001/api/support', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setTickets(json.data)
        }
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/support/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        if (selectedTicket && selectedTicket.id === id) {
           setSelectedTicket({ ...selectedTicket, status });
        }
      }
    } catch (err) {
      console.error("Erreur update ticket", err);
    }
  }

  const openModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const filtered = tickets.filter(t => t.status === tab)

  const getStatusIcon = (status: string) => {
    if (status === 'OPEN') return <Mail size={14} color="#0284C7" />
    if (status === 'IN_PROGRESS') return <Clock size={14} color="#CA8A04" />
    if (status === 'RESOLVED') return <CheckCircle size={14} color="#16A34A" />
    return null
  }

  const getStatusColor = (status: string) => {
    if (status === 'OPEN') return { bg: '#E0F2FE', text: '#0284C7', label: 'Nouveau' }
    if (status === 'IN_PROGRESS') return { bg: '#FEF9C3', text: '#CA8A04', label: 'En cours' }
    if (status === 'RESOLVED') return { bg: '#DCFCE7', text: '#16A34A', label: 'Résolu' }
    return { bg: '#F3F4F6', text: '#374151', label: status }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher par sujet..." />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Aide & Support</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérer les requêtes et messages envoyés par les clients.</p>
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
                {TAB_LABELS[t]} ({tickets.filter(tk => tk.status === t).length})
              </button>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Chargement des requêtes...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8E2', backgroundColor: '#F8F9FA' }}>
                  {['SUJET', 'CLIENT', 'DATE', 'STATUT', 'ACTION'].map(h => (
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
                      Aucun message dans cette catégorie
                    </td>
                  </tr>
                ) : filtered.map((ticket) => {
                  const statusInfo = getStatusColor(ticket.status)
                  return (
                    <tr
                      key={ticket.id}
                      style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', maxWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <HelpCircle size={16} color="#1B4332" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ticket.subject}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{ticket.user?.name || 'Inconnu'}</p>
                        <p style={{ fontSize: '11px', color: '#6B7280' }}>{ticket.user?.email}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', color: '#374151' }}>
                          {new Date(ticket.createdAt).toLocaleDateString()} à {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', backgroundColor: statusInfo.bg }}>
                          {getStatusIcon(ticket.status)}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: statusInfo.text }}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button 
                          onClick={() => openModal(ticket)}
                          style={{
                            height: '30px', padding: '0 12px',
                            backgroundColor: '#1B4332', color: '#fff',
                            fontSize: '11px', fontWeight: 700,
                            borderRadius: '7px', border: 'none', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                          Lire
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

      {isModalOpen && selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
              Détail du Ticket
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '20px' }}>
              Envoyé le {new Date(selectedTicket.createdAt).toLocaleString()}
            </p>
            
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontSize: '13px', color: '#4B5563' }}><strong>Client :</strong> {selectedTicket.user?.name}</p>
              <p style={{ fontSize: '13px', color: '#4B5563' }}><strong>Email :</strong> {selectedTicket.user?.email}</p>
              <p style={{ fontSize: '13px', color: '#4B5563' }}><strong>Téléphone :</strong> {selectedTicket.user?.phone || 'Non renseigné'}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SUJET</label>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                    {selectedTicket.subject}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MESSAGE</label>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', maxHeight: '200px', overflowY: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#374151', fontFamily: 'inherit', margin: 0, lineHeight: 1.5 }}>
                    {selectedTicket.message}
                  </pre>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUT</label>
                <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <option value="OPEN">Nouveau</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolu</option>
                </select>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>La mise à jour se fait automatiquement à la sélection.</p>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
