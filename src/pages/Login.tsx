import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { GraduationCap } from 'lucide-react'

export default function Login() {
  const { logIn } = useApp()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await logIn(identifier, password)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error || 'Login failed')
      return
    }
    navigate(res.isAdmin ? '/admin' : '/')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-green rounded-2xl p-4 mb-3">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">TeachPro</h1>
          <p className="text-gold text-sm mt-1">Learn. Teach. Lead.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 space-y-4 shadow-lg">
          <h2 className="text-navy font-semibold text-lg">Log In</h2>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600">Phone Number</label>
            <input
              type="tel"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="e.g. 0770123456"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-green font-medium">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg active:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-green font-medium">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
