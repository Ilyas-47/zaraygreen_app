// src/app/(dashboard)/customers/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import Header from '@/components/layout/Header'

type UserTab = 'Tous' | 'Client' | 'Technicien' | 'Livreur' | 'Admin'

const TABS: UserTab[] = ['Tous', 'Client', 'Technicien', 'Livreur', 'Admin']

export default function CustomersPage() {
  const router = useRouter()
  const [tab, setTab] = useState<UserTab>('Tous')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Client')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401) return handleUnauthorized()
      
      const json = await res.json()
      if (res.ok && json.success) {
        setUsers(json.data || [])
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnauthorized = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const resetForm = () => {
    setEditingUserId(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('Client')
  }

  const openEditModal = (u: any) => {
    setEditingUserId(u.id)
    setName(u.name)
    setEmail(u.email)
    setRole(u.role)
    setPassword('') // Password not required for update unless changing it, but API currently doesn't update password.
    setIsModalOpen(true)
  }

  const handleSaveUser = async () => {
    if (!name.trim() || !email.trim() || (!editingUserId && !password.trim())) {
      return alert('Veuillez remplir tous les champs obligatoires.')
    }

    try {
      const token = localStorage.getItem('token')
      const method = editingUserId ? 'PUT' : 'POST'
      const url = editingUserId 
        ? `http://localhost:5001/api/users/${editingUserId}`
        : 'http://localhost:5001/api/users'

      const body = editingUserId 
        ? { name, email, role } 
        : { name, email, password, role }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (res.status === 401) return handleUnauthorized()
      
      const json = await res.json()
      if (res.ok && json.success) {
        if (editingUserId) {
          setUsers(prev => prev.map(u => u.id === editingUserId ? json.data : u))
        } else {
          setUsers(prev => [json.data, ...prev])
        }
        resetForm()
        setIsModalOpen(false)
      } else {
        alert('Erreur: ' + (json.message || 'Impossible d\'enregistrer l\'utilisateur.'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401) return handleUnauthorized()
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id))
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5001/api/users/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401) return handleUnauthorized()
      if (res.ok) {
        const json = await res.json()
        setUsers(prev => prev.map(u => u.id === id ? { ...u, active: json.data.active } : u))
      }
    } catch (err) {
      console.error('Erreur toggle:', err)
    }
  }

  // Filtrage
  const filtered = tab === 'Tous' 
    ? users 
    : users.filter(u => u.role?.toLowerCase() === tab.toLowerCase())

  // Helpers pour le design
  const getRoleStyle = (role: string) => {
    const r = role.toLowerCase()
    if (r === 'admin') return { color: '#DC2626', bg: '#FEF2F2' }
    if (r === 'technicien') return { color: '#059669', bg: '#D1FAE5' }
    if (r === 'livreur') return { color: '#1D4ED8', bg: '#DBEAFE' }
    return { color: '#1B4332', bg: '#E8F5E9' } // client default
  }

  const getInitials = (n: string) => {
    const parts = n.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return n.substring(0, 2).toUpperCase()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header searchPlaceholder="Rechercher un utilisateur..." actionLabel="Ajouter un utilisateur" onAction={() => { resetForm(); setIsModalOpen(true) }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Gestion des Utilisateurs</h1>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>Gérez vos clients, techniciens, livreurs et administrateurs.</p>
        </div>

        {/* Table Container */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E2E8E2', paddingLeft: '4px' }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '14px 18px', fontSize: '13px', fontWeight: 600,
                  border: 'none', borderBottom: `2px solid ${tab === t ? '#1B4332' : 'transparent'}`,
                  backgroundColor: 'transparent', cursor: 'pointer',
                  color: tab === t ? '#1B4332' : '#6B7280',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {t}
                {t === 'Tous' && (
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#F4F6F4', color: '#6B7280', padding: '1px 7px', borderRadius: '20px' }}>
                    {users.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F4F6F4' }}>
                {['UTILISATEUR', 'RÔLE', 'STATUT', 'CRÉÉ LE', 'ACTION'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map(u => {
                const style = getRoleStyle(u.role)
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{u.name}</p>
                          <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: style.bg, color: style.color }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => toggleStatus(u.id)} title="Cliquez pour changer le statut">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: u.active ? '#22C55E' : '#9CA3AF' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: u.active ? '#22C55E' : '#9CA3AF' }}>
                          {u.active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button onClick={() => openEditModal(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#1B4332'} onMouseLeave={e => e.currentTarget.style.color = '#6B7280'} title="Modifier">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', transition: 'color 0.15s', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'} title="Supprimer">
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

      {/* --- MODAL UTILISATEUR --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '450px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#111827' }}>
              {editingUserId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOM COMPLET</label>
                <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: Jean Dupont" />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>ADRESSE EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Ex: jean@exemple.com" />
              </div>

              {!editingUserId && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>MOT DE PASSE</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} placeholder="Mot de passe" />
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>RÔLE</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="Client">Client</option>
                  <option value="Technicien">Technicien</option>
                  <option value="Livreur">Livreur</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#374151', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSaveUser} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#fff', backgroundColor: '#1B4332', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{editingUserId ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}