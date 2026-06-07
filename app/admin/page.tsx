'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🐛</span>
          <h1 className="font-display font-black text-2xl text-white mt-4">ADMIN ACCESS</h1>
          <p className="text-white/40 text-sm mt-2">Chill Bugs Team Only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6">
          <div className="mb-4">
            <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff87]/50 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4">❌ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff87] hover:bg-[#00cc6a] disabled:opacity-50 text-black font-display font-black py-3 rounded-xl transition-colors"
          >
            {loading ? 'Verifying...' : 'Enter Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
