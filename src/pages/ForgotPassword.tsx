import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import * as api from '../lib/supabaseApi'
import { isValidPhone } from '../lib/phoneAuth'
import { KeyRound, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const { demoMode } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState<'verify' | 'reset' | 'done'>('verify')
  const [phone, setPhone] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number (10 to 12 digits).')
      return
    }
    const year = parseInt(birthYear, 10)
    if (!year || birthYear.length !== 4) {
      setError('Enter your birth year as 4 digits, e.g. 1990.')
      return
    }

    if (demoMode) {
      setError('Password reset requires a connected backend (see README) — not available in demo mode.')
      return
    }

    setSubmitting(true)
    const matched = await api.verifyResetIdentity(phone, year)
    setSubmitting(false)
    if (!matched) {
      setError("That phone number and year of birth don't match our records.")
      return
    }
    setStep('reset')
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const res = await api.resetLearnerPassword(phone, parseInt(birthYear, 10), newPassword)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error || 'Could not reset your password. Please try again.')
      return
    }
    setStep('done')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-green rounded-2xl p-4 mb-3">
            <KeyRound size={32} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">Reset Your Password</h1>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">
                Enter the phone number your account uses, and your year of birth, to confirm it's
                you.
              </p>
              <div>
                <label className="text-xs font-medium text-gray-600">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input mt-1"
                  placeholder="e.g. 0770123456"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Year of Birth</label>
                <input
                  type="number"
                  required
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="input mt-1"
                  placeholder="e.g. 1990"
                  maxLength={4}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg mt-2 disabled:opacity-60"
              >
                {submitting ? 'Checking…' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3">
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-1">
                Identity confirmed. Set a new password below.
              </p>
              <div>
                <label className="text-xs font-medium text-gray-600">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input mt-1"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg mt-2 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Set New Password'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-2">
              <CheckCircle2 size={40} className="mx-auto text-brand-green mb-2" />
              <p className="font-semibold text-navy">Password updated</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg"
              >
                Go to Login
              </button>
            </div>
          )}

          {step !== 'done' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-brand-green font-medium">
                Back to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
