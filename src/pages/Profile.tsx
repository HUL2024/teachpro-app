import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useApp } from '../context/AppContext'
import { LogOut, User, ShieldCheck, Camera, FileText, Shield, Info, Menu } from 'lucide-react'

export default function Profile() {
  const { currentUser, updateProfile, uploadAvatar, logOut, demoMode } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [form, setForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    school: currentUser?.school || '',
    subject: currentUser?.subject || '',
    bio: currentUser?.bio || '',
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!currentUser) return null

  function handleSave() {
    updateProfile(form)
    setEditing(false)
  }

  function handleLogout() {
    logOut()
    navigate('/login')
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    setUploadingPhoto(true)
    const res = await uploadAvatar(file)
    setUploadingPhoto(false)
    if (!res.ok) setPhotoError(res.error || 'Could not upload photo.')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="pb-24">
      <TopBar
        title="Profile"
        right={
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="More options">
              <Menu size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 w-48 overflow-hidden z-40">
                <MenuLink to="/about" icon={Info} label="About TeachPro" onClick={() => setMenuOpen(false)} />
                <MenuLink to="/terms" icon={FileText} label="Terms & Conditions" onClick={() => setMenuOpen(false)} />
                <MenuLink to="/privacy" icon={Shield} label="Privacy Policy" onClick={() => setMenuOpen(false)} />
              </div>
            )}
          </div>
        }
      />
      <div className="px-4 py-4">
        <div className="flex flex-col items-center py-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="relative bg-navy rounded-full w-20 h-20 flex items-center justify-center overflow-hidden"
          >
            {currentUser.photoUrl ? (
              <img src={currentUser.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-white" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {uploadingPhoto && <p className="text-xs text-gray-400 mt-2">Uploading…</p>}
          {photoError && <p className="text-xs text-red-500 mt-2">{photoError}</p>}
          <p className="font-semibold text-navy mt-2">{currentUser.fullName}</p>
          <p className="text-xs text-gray-400">{currentUser.phone}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <Row label="Full Name" value={form.fullName} editing={editing} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} />
          <Row label="Phone" value={form.phone} editing={editing} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Row label="School" value={form.school} editing={editing} onChange={(v) => setForm((f) => ({ ...f, school: v }))} />
          <Row label="Subject Taught" value={form.subject} editing={editing} onChange={(v) => setForm((f) => ({ ...f, subject: v }))} />
          <Row label="Bio" value={form.bio} editing={editing} onChange={(v) => setForm((f) => ({ ...f, bio: v }))} multiline />

          {editing ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-navy text-white font-semibold py-2.5 rounded-lg text-sm mt-1"
            >
              Edit Profile
            </button>
          )}
        </div>

        {demoMode && (
          <Link
            to="/admin"
            className="w-full flex items-center justify-center gap-2 bg-navy text-white font-medium py-3 mt-6 rounded-lg text-sm"
          >
            <ShieldCheck size={16} />
            Admin Dashboard
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-500 font-medium py-3 mt-6 text-sm"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  )
}

function MenuLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string
  icon: typeof Info
  label: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm text-navy hover:bg-gray-50"
    >
      <Icon size={16} className="text-gray-400" />
      {label}
    </Link>
  )
}

function Row({
  label,
  value,
  editing,
  onChange,
  multiline,
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input mt-1"
            rows={3}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input mt-1"
          />
        )
      ) : (
        <p className="text-sm text-navy mt-0.5">{value || '—'}</p>
      )}
    </div>
  )
}
