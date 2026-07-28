// src/app/(dashboard)/archives/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import Header from '@/components/layout/Header'
import { 
  FileText, 
  DollarSign, 
  Receipt, 
  FileCheck, 
  ArrowRight, 
  Download, 
  Trash2, 
  LayoutGrid, 
  LayoutList, 
  UploadCloud,
  ChevronRight,
  Camera,
  FileSpreadsheet,
  Percent,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react'

const DOC_CATEGORIES = [
  { icon: DollarSign, label: 'Bulletins de Paie', count: 124, sub: 'Mis à jour il y a 2 jours', color: '#1B4332' },
  { icon: Receipt, label: 'Factures & Reçus', count: 842, sub: '842 Fichiers', color: '#40916C' },
  { icon: FileCheck, label: 'Devis & Bons', count: 274, sub: '56 En attente • 218 Total', color: '#52B788' },
]

const INITIAL_DOCS = [
  { icon: DollarSign, name: 'Fiche_Paie_Juillet_2023_JDoe', sub: 'Registre Financier Confidentiel', type: 'PAIE', typeColor: '#1B4332', typeBg: '#E8F5E9', owner: 'John Doe', date: '28 Juil. 2023', size: '1.2 MB' },
  { icon: FileText, name: 'Devis_Mariage_Ete_V02', sub: 'Projet : Bloom & Vow', type: 'DEVIS', typeColor: '#92400E', typeBg: '#FEF3C7', owner: 'Emily Rose', date: '02 Août 2023', size: '4.5 MB' },
  { icon: FileSpreadsheet, name: 'BL-2023-8822_Livraison_Terreau', sub: 'Bon de livraison Terreaux d\'Atlas', type: 'BON_LIVRAISON', typeColor: '#1E3A8A', typeBg: '#DBEAFE', owner: 'Responsable Dépôt', date: '08 Août 2023', size: '2.1 MB' },
  { icon: Receipt, name: 'FAC-2023-9021_Fournisseur', sub: 'Grossiste Flora Amsterdam', type: 'FACTURE', typeColor: '#40916C', typeBg: '#E8F5E9', owner: 'Serv. Finance', date: '09 Août 2023', size: '0.8 MB' },
]

export default function ArchivesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [docs, setDocs] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false) // toggle pour basculer le modal d'importation et de création de document
  const [loading, setLoading] = useState(true)
  
  // Nouveaux états en accord avec l'UML
  const [newType, setNewType] = useState('FACTURE')
  const [newNumero, setNewNumero] = useState('')
  const [newMontantHT, setNewMontantHT] = useState('0')
  const [newMontantTTC, setNewMontantTTC] = useState('0')
  const [newTva, setNewTva] = useState('20')
  const [newStatut, setNewStatut] = useState('ARCHIVE')
  const [newNotes, setNewNotes] = useState('')
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cameraMode, setCameraMode] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setDocs(json.data)
        }
      }
    } catch (err) {
      console.error('Erreur chargement documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      // Auto-remplissage du numéro de document
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      setNewNumero(cleanName)
      
      // Auto-détection du type
      if (file.name.toUpperCase().includes('DEVIS')) {
        setNewType('DEVIS')
      } else if (file.name.toUpperCase().includes('BL') || file.name.toUpperCase().includes('LIVRAISON')) {
        setNewType('BON_LIVRAISON')
      } else if (file.name.toUpperCase().includes('AVOIR')) {
        setNewType('AVOIR')
      } else if (file.name.toUpperCase().includes('CONTRAT')) {
        setNewType('CONTRAT')
      } else if (file.name.toUpperCase().includes('COMMANDE')) {
        setNewType('BON_COMMANDE')
      } else {
        setNewType('FACTURE')
      }
    }
  }

  const triggerCamera = () => {
    setCameraMode(true)
    setPhotoPreview(null)
    setTimeout(() => {
      setPhotoPreview('https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=60')
    }, 1500)
  }

  const handleUpload = async () => {
    if (!newNumero.trim()) {
      alert("Le numéro de document est requis.");
      return;
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: newType,
          numeroDocument: newNumero,
          montantHT: parseFloat(newMontantHT || '0'),
          montantTTC: parseFloat(newMontantTTC || '0'),
          tva: parseFloat(newTva || '0'),
          statut: newStatut,
          fichierUrl: photoPreview || (selectedFile ? selectedFile.name : ''),
          notes: newNotes
        })
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setDocs(prev => [json.data, ...prev])
          
          setNewNumero('')
          setNewMontantHT('0')
          setNewMontantTTC('0')
          setNewNotes('')
          setSelectedFile(null)
          setPhotoPreview(null)
          setCameraMode(false)
          setIsModalOpen(false)
        } else {
          alert('Erreur: ' + (json.message || 'Impossible d\'ajouter le document.'));
        }
      } else {
        const errText = await res.text();
        alert('Erreur Serveur: ' + errText);
      }
    } catch (err: any) {
      console.error('Erreur creation document:', err)
      alert('Erreur réseau lors de la création du document: ' + err.message);
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce document des archives ?')) {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:5001/api/documents/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          setDocs(prev => prev.filter(d => d.id !== id))
        }
      } catch (err) {
        console.error('Erreur suppression document:', err)
      }
    }
  }

  const handleDownload = (doc: any) => {
    const docPdf = new jsPDF()
    docPdf.setFontSize(18)
    docPdf.setTextColor(27, 67, 50)
    docPdf.text('ZARAY GREEN', 105, 20, { align: 'center' })
    docPdf.setFontSize(14)
    docPdf.setTextColor(100, 100, 100)
    docPdf.text(doc.type.replace('_', ' '), 105, 30, { align: 'center' })
    
    docPdf.setFontSize(12)
    docPdf.setTextColor(0, 0, 0)
    docPdf.text(`Numéro Document : ${doc.numeroDocument}`, 20, 50)
    docPdf.text(`Date d'émission : ${new Date(doc.dateEmission || doc.createdAt).toLocaleDateString('fr-FR')}`, 20, 60)
    docPdf.text(`Statut : ${doc.statut}`, 20, 70)
    
    if (doc.montantTTC > 0) {
      docPdf.text(`Montant HT : ${doc.montantHT} MAD`, 20, 90)
      docPdf.text(`Montant TTC : ${doc.montantTTC} MAD`, 20, 100)
      docPdf.text(`TVA : ${doc.tva}%`, 20, 110)
    }

    docPdf.text(`Notes : ${doc.notes || 'Aucune note'}`, 20, 130)

    if (doc.fichierUrl && doc.fichierUrl.length > 0 && !doc.fichierUrl.startsWith('http')) {
        docPdf.text(`Fichier source attaché : ${doc.fichierUrl}`, 20, 150)
    }

    docPdf.save(`${doc.numeroDocument}.pdf`)
  }

  // Calcul dynamique des statistiques par catégorie de documents
  const countDevis = docs.filter(d => d.type === 'DEVIS').length
  const countFacture = docs.filter(d => d.type === 'FACTURE').length
  const countLivraison = docs.filter(d => d.type === 'BON_LIVRAISON').length

  const dynamicCategories = [
    { icon: FileCheck, label: 'Devis', count: countDevis, sub: 'Fichiers enregistrés', color: '#52B788' },
    { icon: Receipt, label: 'Factures & Reçus', count: countFacture, sub: `${countFacture} Fichiers actifs`, color: '#40916C' },
    { icon: FileSpreadsheet, label: 'Livraisons', count: countLivraison, sub: `${countLivraison} Bons de livraison`, color: '#1B4332' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Header
        searchPlaceholder="Rechercher dans les archives..."
        actionLabel="Ajouter un document"
        onAction={() => setIsModalOpen(true)}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F4F6F4' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#9CA3AF', cursor: 'pointer' }}>Général</span>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}><ChevronRight size={12} /></span>
          <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>Archives</span>
        </div>

        {/* Title + Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Bibliothèque de Documents</h1>
            <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '480px', lineHeight: '1.5' }}>
              Gérez de manière sécurisée vos documents professionnels selon le schéma officiel Zaray Green.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setIsCreateMode(false)
                setIsModalOpen(true)
              }}
              style={{
                height: '38px', padding: '0 16px', borderRadius: '8px', border: '1px solid #D1D5DB',
                backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <UploadCloud size={16} />
              Importer
            </button>
            <button
              onClick={() => {
                setIsCreateMode(true)
                setIsModalOpen(true)
              }}
              style={{
                height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none',
                backgroundColor: '#1B4332', color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <FileCheck size={16} />
              Créer un document
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {dynamicCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff', borderRadius: '12px',
                  border: '1px solid #E2E8E2', padding: '20px',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#1B4332')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8E2')}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: cat.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cat.color,
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ color: '#9CA3AF', fontSize: '16px' }}><ArrowRight size={16} /></span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>{cat.label}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  {cat.count} Documents • {cat.sub}
                </p>
              </div>
            )
          })}
        </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8E2', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E2E8E2' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Documents Récents</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Trier par : Date de modification</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['list', 'grid'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setViewMode(v)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '6px',
                        border: `1px solid ${viewMode === v ? '#1B4332' : '#E2E8E2'}`,
                        backgroundColor: viewMode === v ? '#E8F5E9' : '#fff',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: viewMode === v ? '#1B4332' : '#9CA3AF',
                      }}
                    >
                      {v === 'list' ? <LayoutList size={14} /> : <LayoutGrid size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
                Chargement des documents...
              </div>
            ) : viewMode === 'list' ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F4F6F4' }}>
                      {['RÉFÉRENCE', 'TYPE', 'STATUT', 'DATE ÉMISSION', 'MONTANT TTC', 'ACTIONS'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {docs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
                          Aucun document trouvé
                        </td>
                      </tr>
                    ) : docs.map((doc, i) => {
                      const typeIconMap: Record<string, any> = {
                        PAIE: DollarSign,
                        DEVIS: FileText,
                        BON_LIVRAISON: FileSpreadsheet,
                        AVOIR: Percent,
                        CONTRAT: ShieldCheck,
                        BON_COMMANDE: ShoppingCart,
                        PHOTO_INTERVENTION: Camera,
                        FACTURE: Receipt
                      }

                      const typeColorMap: Record<string, { bg: string; color: string }> = {
                        PAIE: { bg: '#E8F5E9', color: '#1B4332' },
                        DEVIS: { bg: '#FEF3C7', color: '#92400E' },
                        BON_LIVRAISON: { bg: '#DBEAFE', color: '#1E3A8A' },
                        FACTURE: { bg: '#FEE2E2', color: '#B91C1C' },
                        AVOIR: { bg: '#F3E8FF', color: '#6B21A8' },
                        CONTRAT: { bg: '#ECEFEE', color: '#0F2B1F' },
                        BON_COMMANDE: { bg: '#FFF7ED', color: '#C2410C' },
                        PHOTO_INTERVENTION: { bg: '#ECFDF5', color: '#047857' },
                      }

                      const Icon = typeIconMap[doc.type] || FileText;
                      const colors = typeColorMap[doc.type] || { bg: '#F4F6F4', color: '#6B7280' };

                      return (
                        <tr
                          key={doc.id}
                          style={{ borderBottom: '1px solid #F4F6F4', transition: 'background 0.1s' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Name */}
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: colors.color }}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{doc.numeroDocument}</p>
                                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{doc.notes || 'Pas de notes'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700,
                              padding: '3px 8px', borderRadius: '5px',
                              backgroundColor: colors.bg, color: colors.color,
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              {doc.type}
                            </span>
                          </td>

                          {/* Statut */}
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700,
                              padding: '3px 8px', borderRadius: '5px',
                              backgroundColor: '#F3F4F6', color: '#374151',
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              {doc.statut}
                            </span>
                          </td>

                          {/* Date */}
                          <td style={{ padding: '14px 20px', fontSize: '12px', color: '#374151' }}>
                            {new Date(doc.dateEmission || doc.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>

                          {/* Montant TTC */}
                          <td style={{ padding: '14px 20px', fontSize: '12px', color: '#1A1A1A', fontWeight: 600 }}>{doc.montantTTC.toLocaleString()} MAD</td>

                          {/* Actions */}
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button 
                                onClick={() => handleDownload(doc)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4332', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Download size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(doc.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #E2E8E2' }}>
                  <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Affichage 1–{docs.length} de {docs.length} résultats</p>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1].map((p, i) => (
                      <button
                        key={i}
                        style={{
                          width: '28px', height: '28px', borderRadius: '7px',
                          fontSize: '12px', fontWeight: 500,
                          border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          backgroundColor: p === 1 ? '#1B4332' : 'transparent',
                          color: p === 1 ? '#fff' : '#6B7280',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '20px' }}>
                {docs.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#9CA3AF', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Aucun document trouvé</p>
                ) : docs.map((doc) => {
                  const typeIconMap: Record<string, any> = {
                    PAIE: DollarSign, DEVIS: FileText, BON_LIVRAISON: FileSpreadsheet,
                    AVOIR: Percent, CONTRAT: ShieldCheck, BON_COMMANDE: ShoppingCart,
                    PHOTO_INTERVENTION: Camera, FACTURE: Receipt
                  }
                  const typeColorMap: Record<string, { bg: string; color: string }> = {
                    PAIE: { bg: '#E8F5E9', color: '#1B4332' }, DEVIS: { bg: '#FEF3C7', color: '#92400E' },
                    BON_LIVRAISON: { bg: '#DBEAFE', color: '#1E3A8A' }, FACTURE: { bg: '#FEE2E2', color: '#B91C1C' },
                    AVOIR: { bg: '#F3E8FF', color: '#6B21A8' }, CONTRAT: { bg: '#ECEFEE', color: '#0F2B1F' },
                    BON_COMMANDE: { bg: '#FFF7ED', color: '#C2410C' }, PHOTO_INTERVENTION: { bg: '#ECFDF5', color: '#047857' },
                  }
                  const Icon = typeIconMap[doc.type] || FileText;
                  const colors = typeColorMap[doc.type] || { bg: '#F4F6F4', color: '#6B7280' };
                  return (
                    <div key={doc.id} style={{ border: '1px solid #E2E8E2', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '5px', backgroundColor: colors.bg, color: colors.color, textTransform: 'uppercase' }}>
                          {doc.type}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{doc.numeroDocument}</p>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{doc.notes || 'Pas de notes'}</p>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Date: {new Date(doc.dateEmission || doc.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      {doc.montantTTC > 0 && (
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B4332' }}>{doc.montantTTC.toLocaleString()} MAD</p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F4F6F4' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280' }}>{doc.statut}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleDownload(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4332' }}>
                            <Download size={14} />
                          </button>
                          <button onClick={() => handleDelete(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

      </div>

      {/* Modal - Importer un document */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
            width: '100%', maxWidth: '420px', border: '1px solid #E2E8E2',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={20} color="#1B4332" /> {isCreateMode ? 'Créer un nouveau document' : 'Importer ou scanner un document'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              
              {/* Type de Document */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>TYPE DE DOCUMENT</label>
                <select 
                  value={newType} 
                  onChange={e => setNewType(e.target.value)}
                  style={{ width: '100%', height: '36px', padding: '0 8px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#fff', outline: 'none' }}
                >
                  <option value="FACTURE">Facture & Reçu</option>
                  <option value="DEVIS">Devis Client</option>
                  <option value="BON_LIVRAISON">Bon de Livraison</option>
                  <option value="AVOIR">Avoir</option>
                  <option value="CONTRAT">Contrat</option>
                  <option value="BON_COMMANDE">Bon de Commande</option>
                  <option value="PHOTO_INTERVENTION">Photo d'Intervention</option>
                  <option value="PAIE">Bulletin de Paie</option>
                </select>
              </div>

              {/* Upload Fichier */}
              {!isCreateMode && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>CHARGER UN DOCUMENT (PDF, PNG, JPG)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{
                      flex: 1, height: '38px', border: '1.5px dashed #D1D5DB', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      cursor: 'pointer', fontSize: '12px', color: '#4B5563', backgroundColor: '#F9FAFB'
                    }}>
                      <UploadCloud size={16} />
                      {selectedFile ? selectedFile.name.slice(0, 20) + '...' : 'Choisir un fichier'}
                      <input 
                        type="file" 
                        accept="application/pdf,image/*" 
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    
                    {/* Prendre une photo */}
                    <button
                      onClick={triggerCamera}
                      style={{
                        height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB',
                        backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', color: '#4B5563'
                      }}
                    >
                      <Camera size={16} />
                      Scanner/Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Caméra Scan simulation preview */}
              {cameraMode && !isCreateMode && (
                <div style={{ border: '1px solid #E2E8E2', borderRadius: '8px', padding: '10px', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '10px', color: '#1B4332', fontWeight: 600 }}>[ Simulation Scan Caméra en cours... ]</p>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Scan preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB', borderRadius: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Calibrage...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Numéro de Document */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NUMÉRO DE DOCUMENT</label>
                <input 
                  type="text" 
                  value={newNumero}
                  onChange={e => setNewNumero(e.target.value)}
                  placeholder="Ex: ZG-DEV-2026-004"
                  style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>

              {/* Montant HT & TTC */}
              {isCreateMode && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>MONTANT HT (MAD)</label>
                    <input 
                      type="number" 
                      value={newMontantHT}
                      onChange={e => setNewMontantHT(e.target.value)}
                      style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>MONTANT TTC (MAD)</label>
                    <input 
                      type="number" 
                      value={newMontantTTC}
                      onChange={e => setNewMontantTTC(e.target.value)}
                      style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '6px' }}>NOTES / DESCRIPTION</label>
                <input 
                  type="text" 
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Ex: Devis pour projet paysager Rabat"
                  style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  setCameraMode(false)
                  setPhotoPreview(null)
                  setSelectedFile(null)
                }}
                style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid #E2E8E2', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={handleUpload}
                style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: 'none', backgroundColor: '#1B4332', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                {isCreateMode ? 'Créer et Générer PDF' : 'Ajouter l\'archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}