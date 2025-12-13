'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      // ▼ ここを変更しました！ (/mypage -> /showcase)
      router.push('/showcase')
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the confirmation link.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Personal Shopper
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {message && (
            <div className="p-3 bg-pink-500/10 border border-pink-500/50 rounded text-pink-200 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>

          <div className="text-center text-gray-500 text-sm mt-4">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="text-pink-400 hover:underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}