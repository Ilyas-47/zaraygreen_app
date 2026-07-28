// src/app/(dashboard)/page.tsx
'use client'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useEffect } from 'react'
import { ShoppingBag, Landmark, Activity, CheckSquare } from 'lucide-react'

const ACTIVITIES = [
  { color: '#1B4332', bg: '#E8F5E9', icon: ShoppingBag, title: 'Nouvelle commande #88219 reçue pour la prestation Orchid Gala.', time: 'il y a 2 minutes • Rabat, Maroc' },
  { color: '#40916C', bg: '#E8F5E9', icon: Activity, title: 'Projet mis à jour : Installation de la serre Phase II complétée.', time: 'il y a 3 heures • Équipe de Maintenance' },
  { color: '#EF4444', bg: '#FEE2E2', icon: Activity, title: 'Alerte Stock : Niveau bas sur les variétés Monstera Obliqua.', time: 'il y a 1 jour • Entrepôt principal' },
]

const INIT_TASKS = [
  { label: 'Audit hebdomadaire de stock : Secteur D', due: 'Aujourd\'hui', done: false },
  { label: 'Confirmer les appels fournisseurs pour les espèces rares', due: 'Demain', done: false },
  { label: 'Valider les heures pour les botanistes concepteurs', due: 'Terminé', done: true },
  { label: 'Réunion trimestrielle de revue budgétaire', due: 'Vendredi, 14:00', done: false },
]

export default function DashboardPage() {
  const [tasks, setTasks] = useState(INIT_TASKS)
  const [statsData, setStatsData] = useState<any>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newLabel, setNewLabel]       = useState('')
  const [newDue, setNewDue]           = useState('')

  const addTask = () => {
    if (!newLabel.trim()) return
    setTasks(prev => [...prev, { label: newLabel, due: newDue || 'Sans échéance', done: false }])
    setNewLabel('')
    setNewDue('')
    setIsModalOpen(false)
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5001/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setStatsData(json.data)
          }
        }
      } catch (err) {
        console.error('Erreur stats dashboard:', err)
      }
    }
    fetchStats()
  }, [])

  const stats = [
    { label: 'Total Commandes', value: statsData?.totalOrders?.value || '0', change: statsData?.totalOrders?.change || '0%', icon: ShoppingBag },
    { label: 'Projets Actifs', value: statsData?.activeProjects?.value || '0', change: statsData?.activeProjects?.change || '', icon: Activity },
    { label: 'Revenu Mensuel', value: statsData?.monthlyRevenue?.value || '0 MAD', target: statsData?.monthlyRevenue?.target || 'Objectif: 50 000 MAD', icon: Landmark },
  ]

  const toggle = (i: number) =>
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header searchPlaceholder="Rechercher des commandes, des clients ou du stock..." actionLabel="Ajouter" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {s.target && (
                      <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                        {s.target}
                      </p>
                    )}
                    {s.change && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#22C55E', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginBottom: '6px' }}>
                        {s.change}
                      </span>
                    )}
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{s.label}</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A' }}>{s.value}</p>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F4F6F4', borderRadius: '8px', color: '#1B4332' }}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Activity Feed */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Activités Récentes</p>
                <button style={{ fontSize: '12px', color: '#1B4332', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Voir Tout
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ACTIVITIES.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: a.color }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: '1.5' }}>{a.title}</p>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>{a.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Featured Product */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #0F2B1F 0%, #1B4332 50%, #40916C 100%)', padding: '24px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <p style={{ fontSize: '10px', color: '#86EFAC', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                  Élément à la Une de l'Inventaire
                </p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Alocasia Silver Dragon</p>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '16px' }}>
                  Une pièce maîtresse pour toute collection de boutique. Le feuillage vert métallisé et texturé de l'Alocasia Silver Dragon est actuellement à pleine maturité. Nous avons sécurisé 15 spécimens de notre producteur de premier choix dans les hautes terres.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ height: '34px', padding: '0 16px', backgroundColor: '#1B4332', color: '#fff', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    Réapprovisionner
                  </button>
                  <button style={{ height: '34px', padding: '0 16px', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1px solid #E2E8E2', cursor: 'pointer' }}>
                    Voir les statistiques
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Stock Health */}
            <div style={{ backgroundColor: '#1B4332', borderRadius: '12px', padding: '20px', color: '#fff' }}>
              <p style={{ fontSize: '10px', color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '4px' }}>
                Écosystème Actuel
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Santé du Stock</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>98%</p>
                  <p style={{ fontSize: '11px', color: '#86EFAC', marginTop: '6px' }}>Statut Optimal</p>
                </div>
                <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#52B788" strokeWidth="3"
                      strokeDasharray="86.3 88" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Critical Tasks */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', padding: '20px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Tâches Critiques</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#F4F6F4', border: '1px solid #E2E8E2', cursor: 'pointer', fontSize: '16px', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {tasks.map((task, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div
                      onClick={() => toggle(i)}
                      style={{
                        width: '16px', height: '16px', marginTop: '2px',
                        borderRadius: '4px', flexShrink: 0, cursor: 'pointer',
                        border: task.done ? 'none' : '2px solid #D1D5DB',
                        backgroundColor: task.done ? '#1B4332' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {task.done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: task.done ? '#9CA3AF' : '#374151', textDecoration: task.done ? 'line-through' : 'none', lineHeight: '1.4' }}>
                        {task.label}
                      </p>
                      <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{task.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal - Nouvelle Tâche */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
            width: '100%', maxWidth: '380px', border: '1px solid #E2E8E2',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px' }}>Ajouter une tâche</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOM DE LA TÂCHE</label>
                <input 
                  type="text" 
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Ex: Arrosage secteur C..."
                  style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>ÉCHÉANCE</label>
                <input 
                  type="text" 
                  value={newDue}
                  onChange={e => setNewDue(e.target.value)}
                  placeholder="Ex: Due today, Vendredi..."
                  style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid #E2E8E2', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={addTask}
                style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: 'none', backgroundColor: '#1B4332', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}