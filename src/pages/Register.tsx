import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { isValidPhone } from '../lib/phoneAuth'

const COUNTRIES = ['Liberia', 'Ghana', 'Nigeria', 'Sierra Leone', 'Ivory Coast', 'Guinea', 'Other']

export default function Register() {
  const { signUp } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    country: 'Liberia',
    school: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isValidPhone(form.phone)) {
      setError('Enter a valid phone number (10 to 12 digits).')
      return
    }
    if (!form.dateOfBirth) {
      setError('Enter your date of birth.')
      return
    }

    setSubmitting(true)
    // No separate "email" field -- the phone number is the account's main
    // identifier. An internal email is generated behind the scenes purely
    // because the auth system requires one; the learner never sees it.
    const res = await signUp({ ...form, email: '' })
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error || 'Could not create account')
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-navy px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-white text-xl font-bold mb-1">Create Account</h1>
        <p className="text-gray-300 text-sm mb-6">Join TeachPro and start learning for free.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 space-y-3 shadow-lg">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Field label="Full Name">
            <input
              required
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input"
              placeholder="e.g. 0770123456"
            />
          </Field>
          <p className="text-[10px] text-gray-400 -mt-2">
            Used to log in — 10 to 12 digits. Keep this handy for password recovery too.
          </p>
          <Field label="Date of Birth">
            <input
              type="date"
              required
              value={form.dateOfBirth}
              onChange={(e) => update('dateOfBirth', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Country">
            <select
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className="input"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="School / Institution">
            <input
              required
              value={form.school}
              onChange={(e) => update('school', e.target.value)}
              className="input"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg mt-2 active:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-green font-medium">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
