'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [remember, setRemember]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        localStorage.setItem('token', json.data.token)
        localStorage.setItem('user', JSON.stringify(json.data.user))
        router.push('/dashboard')
      } else {
        setError(json.message || 'Identifiants invalides.')
      }
    } catch {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F6F4] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E2E8E2] shadow-xl overflow-hidden"
      >
        <div className="p-8 pb-6 text-center border-b border-[#E2E8E2] bg-[#FAFAFA]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F5E9] text-[#1B4332] mb-4">
            <Leaf size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Zaray Green</h1>
          <p className="text-xs uppercase tracking-widest text-[#6B7280] mt-2 font-medium">Plateforme d'Administration</p>
        </div>

        <div className="p-10 pt-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[#FEE2E2]/50 border border-[#F87171]/30 rounded-xl text-[#EF4444] text-[13px] font-medium flex items-center gap-3">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[0.15em] text-[#6B7280] uppercase">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@zaraygreen.com"
                required
                style={{ height: '52px' }}
                className="w-full px-4 border-b-2 border-[#E2E8E2] bg-[#FAFAFA] rounded-t-lg text-[#1A1A1A] text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1B4332] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold tracking-[0.15em] text-[#6B7280] uppercase">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ height: '52px' }}
                  className="w-full px-4 pr-12 border-b-2 border-[#E2E8E2] bg-[#FAFAFA] rounded-t-lg text-[#1A1A1A] text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1B4332] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1B4332] transition-colors"
                >
                  {showPass ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-[#E2E8E2] text-[#1B4332] focus:ring-[#1B4332] cursor-pointer accent-[#1B4332]"
                />
                <span className="text-[12px] text-[#6B7280]">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-[12px] font-bold text-[#1B4332] hover:underline transition-all">
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ height: '52px', marginTop: '40px' }}
              className="group w-full rounded-xl bg-[#1B4332] text-white text-[13px] font-bold tracking-widest uppercase hover:bg-[#0F2B1F] active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#1B4332]/20"
            >
              <span>{loading ? 'Connexion...' : 'Se Connecter'}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-[#FAFAFA] border-t border-[#E2E8E2] text-center">
          <p className="text-[11px] font-medium tracking-widest uppercase text-[#9CA3AF]">
            Accès restreint
          </p>
        </div>
      </motion.div>
    </div>
  )
}