// src/app/(dashboard)/appointments/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Calendar, MapPin, Wrench } from 'lucide-react'

type Tab = 'REQUESTED' | 'ACCEPTED' | 'EN_COURS' | 'DONE' | 'CANCELLED'

const TAB_LABELS: Record<Tab, string> = {
  REQUESTED: 'Nouvelles',
  ACCEPTED: 'Assignées',
  EN_COURS: 'En cours',
  DONE: 'Terminées',
  CANCELLED: 'Annulées'
}

const TABS: Tab[] = ['REQUESTED', 'ACCEPTED', 'EN_COURS', 'DONE', 'CANCELLED']

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Tab>('REQUESTED')
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [technicians, setTechnicians] = useState<any[]>([])

  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const res = await fetch(`http://localhost:5001/api/appointments?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) setAppointments(json.data)
      }

      const usersRes = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (usersRes.ok) {
        const uJson = await usersRes.json()
        if (uJson.success && uJson.data) {
          const onlyTechs = uJson.data.filter((u: any) => u.role?.toLowerCase() === 'technicien')
          setTechnicians(onlyTechs)
        }
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAppointment = async (id: string, updates: { status?: string, technicianId?: string }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates, technicianId: updates.technicianId !== undefined ? updates.technicianId : a.technicianId } : a));
        if (selectedAppointment && selectedAppointment.id === id) {
           setSelectedAppointment({ ...selectedAppointment, ...updates, technicianId: updates.technicianId !== undefined ? updates.technicianId : selectedAppointment.technicianId });
        }
      } else {
        const err = await res.json()
        alert('Erreur: ' + err.message)
      }
    } catch (err) {
      console.error("Erreur réseau update appointment", err);
    }
  }

  const openManageModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsManageModalOpen(true);
  }

  const handleGenerateDocument = (type: string) => {
    if (!selectedAppointment) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${type} - Réservation #${selectedAppointment.id.slice(0, 8).toUpperCase()}</title>
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
              <p>${type} d'Intervention</p>
              <p>Date d'émission: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="details">
              <h3>Client: ${selectedAppointment.user?.name || 'Inconnu'}</h3>
              <p>Email: ${selectedAppointment.user?.email || '-'}</p>
              <p>Téléphone: ${selectedAppointment.user?.phone || '-'}</p>
              <p>Adresse d'intervention: ${selectedAppointment.address || '-'}</p>
              <br/>
              <h3>Référence Réservation: #${selectedAppointment.id.slice(0, 8).toUpperCase()}</h3>
              <p>Date souhaitée: ${selectedAppointment.scheduledAt ? new Date(selectedAppointment.scheduledAt).toLocaleDateString() : 'Non planifiée'}</p>
              <p>Technicien assigné: ${selectedAppointment.technician?.name || 'Non assigné'}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Prix de Base (Estimatif)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${selectedAppointment.service?.name || 'Service'} - ${selectedAppointment.service?.description?.slice(0, 50)}...</td>
                  <td>${selectedAppointment.service?.basePrice ? selectedAppointment.service.basePrice.toFixed(2) + ' MAD' : 'Sur devis'}</td>
                </tr>
              </tbody>
            </table>
            <div class="total">
              TOTAL ESTIMÉ: ${selectedAppointment.service?.basePrice ? selectedAppointment.service.basePrice.toFixed(2) + ' MAD' : 'Sur devis'}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filtered = appointments.filter(a => a.status === tab)

  const requestedCount = appointments.filter(a => a.status === 'REQUESTED').length
  const acceptedCount = appointments.filter(a => a.status === 'ACCEPTED').length
  const enCoursCount = appointments.filter(a => a.status === 'EN_COURS').length
  const totalActive = requestedCount + acceptedCount + enCoursCount
  const capacityPct = totalActive > 0 ? Math.min(Math.round(((acceptedCount + enCoursCount) / totalActive) * 100), 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher par ID ou client..." actionLabel="Nouveau Rendez-vous" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Title + Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Réservations de Services</h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Suivre et planifier les interventions chez les clients.</p>
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
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

          {/* Table */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
                Chargement des réservations...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8E2' }}>
                    {['RÉFÉRENCE', 'CLIENT', 'SERVICE', 'DATE / ADRESSE', 'ACTION'].map(h => (
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
                        Aucune réservation dans cette catégorie
                      </td>
                    </tr>
                  ) : filtered.map((appt) => {
                    const initials = appt.user?.name ? appt.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                    const dateStr = appt.scheduledAt ? new Date(appt.scheduledAt).toLocaleDateString() : 'Non planifié';
                    return (
                      <tr
                        key={appt.id}
                        style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#374151' }}>
                            #{appt.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{appt.user?.name || 'Inconnu'}</p>
                              <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{appt.user?.phone || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Wrench size={14} color="#6B7280" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>
                              {appt.service?.name || 'Service supprimé'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '12px', color: '#374151', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {dateStr}
                          </p>
                          <p style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {appt.address?.slice(0, 20)}...
                          </p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button 
                            onClick={() => openManageModal(appt)}
                            style={{
                              height: '30px', padding: '0 12px',
                              backgroundColor: '#1B4332', color: '#fff',
                              fontSize: '11px', fontWeight: 700,
                              borderRadius: '7px', border: 'none', cursor: 'pointer',
                              fontFamily: 'Inter, sans-serif',
                          }}>
                            {tab === 'DONE' ? 'Détails' : 'Gérer'}
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
            <div style={{ backgroundColor: '#1B4332', borderRadius: '12px', padding: '20px', color: '#fff' }}>
              <p style={{ fontSize: '10px', color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '12px' }}>
                Charge interventions
              </p>
              <p style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>{totalActive}</p>
              <p style={{ fontSize: '12px', color: '#86EFAC', lineHeight: '1.5', marginBottom: '16px' }}>
                Interventions actives à planifier ou réaliser.
              </p>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '10px', color: '#86EFAC', marginBottom: '8px' }}>{capacityPct}% de capacité confirmée</p>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${capacityPct}%`, backgroundColor: '#52B788', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MANAGE MODAL */}
      {isManageModalOpen && selectedAppointment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Gérer la Réservation #{selectedAppointment.id.slice(0, 8).toUpperCase()}
            </h2>
            
            <div style={{ marginBottom: '20px', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}><strong>Client :</strong> {selectedAppointment.user?.name} ({selectedAppointment.user?.phone})</p>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}><strong>Service :</strong> {selectedAppointment.service?.name}</p>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}><strong>Adresse :</strong> {selectedAppointment.address}</p>
              <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}><strong>Date souhaitée :</strong> {selectedAppointment.scheduledAt ? new Date(selectedAppointment.scheduledAt).toLocaleDateString() : 'Non renseignée'}</p>
              {selectedAppointment.notes && (
                <p style={{ fontSize: '13px', color: '#4B5563' }}><strong>Notes :</strong> {selectedAppointment.notes}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>STATUT DE L'INTERVENTION</label>
                <select 
                  value={selectedAppointment.status}
                  onChange={(e) => handleUpdateAppointment(selectedAppointment.id, { status: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', marginBottom: '16px' }}
                >
                  <option value="REQUESTED">Nouvelle demande</option>
                  <option value="ACCEPTED">Planifiée / Assignée</option>
                  <option value="EN_COURS">En cours d'intervention</option>
                  <option value="DONE">Intervention Terminée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>

                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>ASSIGNER UN TECHNICIEN</label>
                <select 
                  value={selectedAppointment.technicianId || ''}
                  onChange={(e) => handleUpdateAppointment(selectedAppointment.id, { technicianId: e.target.value || undefined })}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                >
                  <option value="">-- Sélectionner un technicien --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>La mise à jour se fait automatiquement à la sélection.</p>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>DOCUMENTS D'INTERVENTION</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleGenerateDocument('Devis')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '40px', backgroundColor: '#F3F4F6', color: '#1F2937', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>
                    Générer Devis
                  </button>
                  <button onClick={() => handleGenerateDocument('Bon de Prestation')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '40px', backgroundColor: '#F3F4F6', color: '#1F2937', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>
                    Générer Bon
                  </button>
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
