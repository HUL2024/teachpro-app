import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import * as api from '../../lib/supabaseApi'
import type { Course, Lesson } from '../../lib/types'
import LessonContent from '../../components/LessonContent'
import {
  Users,
  BarChart3,
  Award,
  LogOut,
  ArrowLeftCircle,
  ShieldPlus,
  Trash2,
  BookOpen,
  Plus,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

type Tab = 'courses' | 'certificates' | 'users' | 'analytics' | 'admins'

const TAB_META: Record<Tab, { label: string; icon: typeof Award }> = {
  courses: { label: 'Courses', icon: BookOpen },
  certificates: { label: 'Certificates', icon: Award },
  users: { label: 'Users', icon: Users },
  analytics: { label: 'Analytics', icon: BarChart3 },
  admins: { label: 'Admins', icon: ShieldPlus },
}

// Each tab is gated by a specific permission -- these don't all match the
// tab's own name (the Courses tab needs 'content', Admins needs
// 'manage_admins'), so this mapping has to be explicit rather than just
// checking permissions.includes(tabKey).
const TAB_PERMISSION: Record<Tab, string> = {
  courses: 'content',
  certificates: 'certificates',
  users: 'users',
  analytics: 'analytics',
  admins: 'manage_admins',
}

export default function AdminDashboard() {
  const { demoMode, currentAdmin, certRequests, courses, refreshCourses, logOut } = useApp()
  const navigate = useNavigate()

  const isSuperAdmin = demoMode || currentAdmin?.role === 'super_admin'
  const permissions = demoMode
    ? ['certificates', 'users', 'analytics', 'manage_admins', 'content']
    : currentAdmin?.permissions || []
  const availableTabs = (['courses', 'certificates', 'users', 'analytics', 'admins'] as Tab[]).filter(
    (t) => permissions.includes(TAB_PERMISSION[t])
  )

  const [liveCertRequests, setLiveCertRequests] = useState<api.AdminCertRequest[]>([])
  const [tab, setTab] = useState<Tab>('certificates')

  async function refreshCertRequests() {
    if (demoMode) return
    setLiveCertRequests(await api.fetchAllCertRequestsAdmin())
  }

  useEffect(() => {
    if (!demoMode) refreshCertRequests()
  }, [demoMode])

  // Once we know which tabs this admin actually has, make sure the active
  // tab is one of them (covers the case where the default 'certificates'
  // isn't in their permission set).
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(tab)) {
      setTab(availableTabs[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTabs.join(',')])

  if (!demoMode && !currentAdmin) {
    return <Navigate to="/" replace />
  }

  const pendingCertCount = demoMode
    ? certRequests.filter((r) => r.status === 'pending').length
    : liveCertRequests.filter((r) => r.status === 'pending').length

  function handleLogout() {
    logOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="w-64 shrink-0 bg-black text-white flex flex-col min-h-screen border-r-2 border-gold">
        <div className="flex items-center gap-2 px-5 py-6">
          <ShieldCheck size={22} className="text-gold" />
          <div>
            <p className="font-bold leading-tight">TeachPro</p>
            <p className="text-[10px] tracking-widest text-gold">ADMIN</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {availableTabs.map((t) => {
            const { label, icon: Icon } = TAB_META[t]
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-gold/15 text-gold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} />
                  {label}
                </span>
                {t === 'certificates' && pendingCertCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {pendingCertCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-3 pb-5 space-y-1 border-t border-white/10 pt-4">
          {currentAdmin && (
            <p className="px-3 text-xs text-gray-400 mb-2 truncate">
              {currentAdmin.fullName} · {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
          >
            <ArrowLeftCircle size={16} />
            Teacher View
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-white/5"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ---------- Main content ---------- */}
      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-lg font-bold text-navy">{TAB_META[tab].label}</h1>
        </header>
        <div className="max-w-5xl px-8 py-6">
          {tab === 'courses' && (
            <CoursesTab demoMode={demoMode} courses={courses} refreshCourses={refreshCourses} />
          )}
          {tab === 'certificates' && (
            <CertificatesTab
              demoMode={demoMode}
              certRequests={certRequests}
              liveCertRequests={liveCertRequests}
              refreshCertRequests={refreshCertRequests}
              currentAdminId={currentAdmin?.id}
              courses={courses}
            />
          )}
          {tab === 'users' && <UsersTab demoMode={demoMode} isSuperAdmin={isSuperAdmin} />}
          {tab === 'analytics' && <AnalyticsTab demoMode={demoMode} courses={courses} />}
          {tab === 'admins' && (
            <AdminsTab demoMode={demoMode} currentAdminId={currentAdmin?.id} isSuperAdmin={isSuperAdmin} />
          )}
        </div>
      </main>
    </div>
  )
}

// ---------------- Certificates tab ----------------

function CertificatesTab({
  demoMode,
  certRequests,
  liveCertRequests,
  refreshCertRequests,
  currentAdminId,
  courses,
}: {
  demoMode: boolean
  certRequests: ReturnType<typeof useApp>['certRequests']
  liveCertRequests: api.AdminCertRequest[]
  refreshCertRequests: () => Promise<void>
  currentAdminId?: string
  courses: Course[]
}) {
  const [issuingFor, setIssuingFor] = useState<string | null>(null)
  const [certLink, setCertLink] = useState('')
  const [linkError, setLinkError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function openIssueDialog(requestId: string) {
    setIssuingFor(requestId)
    setCertLink('')
    setLinkError('')
  }

  async function handleConfirmIssue() {
    if (!currentAdminId || !issuingFor) return
    const trimmed = certLink.trim()
    if (!trimmed) {
      setLinkError('Paste the Google Drive link to the certificate before confirming.')
      return
    }
    setSubmitting(true)
    await api.markCertificateIssuedRemote(issuingFor, currentAdminId, trimmed)
    setSubmitting(false)
    setIssuingFor(null)
    await refreshCertRequests()
  }

  return (
    <div className="space-y-3">
      {demoMode && (
        <p className="text-xs text-gray-400">
          Demo mode: this only shows requests from the currently logged-in demo account, since
          there's no shared backend yet.
        </p>
      )}

      {demoMode &&
        certRequests.map((r) => {
          const course = courses.find((c) => c.id === r.courseId)
          return (
            <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm font-medium text-navy">{course?.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                Requested {new Date(r.requestedAt).toLocaleString()}
              </p>
              {r.transactionRef && <p className="text-xs text-gray-500 mt-1">Ref: {r.transactionRef}</p>}
              <span
                className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {r.status.toUpperCase()}
              </span>
            </div>
          )
        })}
      {demoMode && certRequests.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-10">No certificate requests yet.</p>
      )}

      {!demoMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {liveCertRequests.map((r) => {
            const course = courses.find((c) => c.id === r.courseId)
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-navy">{course?.title ?? r.courseId}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {r.learnerName} · {r.learnerPhone}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Requested {new Date(r.requestedAt).toLocaleString()}
                </p>
                {r.transactionRef && <p className="text-xs text-gray-500 mt-1">Ref: {r.transactionRef}</p>}

                {issuingFor === r.id ? (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-600">
                      Google Drive certificate link
                    </label>
                    <input
                      value={certLink}
                      onChange={(e) => {
                        setCertLink(e.target.value)
                        if (linkError) setLinkError('')
                      }}
                      placeholder="https://drive.google.com/..."
                      className="input mt-1"
                    />
                    {linkError && <p className="text-xs text-red-600 mt-1">{linkError}</p>}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleConfirmIssue}
                        disabled={submitting}
                        className="flex-1 bg-brand-green text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50"
                      >
                        {submitting ? 'Confirming…' : 'Confirm & Issue'}
                      </button>
                      <button
                        onClick={() => setIssuingFor(null)}
                        className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                    {r.status === 'pending' && (
                      <button
                        onClick={() => openIssueDialog(r.id)}
                        className="flex items-center gap-1 bg-brand-green text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        <CheckCircle2 size={14} />
                        Confirm & Issue
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {!demoMode && liveCertRequests.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-10">No certificate requests yet.</p>
      )}
    </div>
  )
}

// ---------------- Users tab (learners) ----------------

function UsersTab({ demoMode, isSuperAdmin }: { demoMode: boolean; isSuperAdmin: boolean }) {
  const [learners, setLearners] = useState<api.AdminLearnerRow[]>([])
  const [loading, setLoading] = useState(!demoMode)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function loadAll() {
    setLoading(true)
    setLearners(await api.fetchAllLearnersAdmin())
    setLoading(false)
  }

  useEffect(() => {
    if (!demoMode) loadAll()
  }, [demoMode])

  async function handleToggleDisabled(l: api.AdminLearnerRow) {
    const verb = l.isDisabled ? 'Enable' : 'Disable'
    if (!confirm(`${verb} ${l.fullName}'s account?`)) return
    setBusyId(l.id)
    await api.setLearnerDisabled(l.id, !l.isDisabled)
    await loadAll()
    setBusyId(null)
  }

  if (demoMode) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        User list requires a shared backend. Connect Supabase (see README) to see everyone who's
        registered.
      </p>
    )
  }

  if (loading) return <p className="text-sm text-gray-400 text-center mt-10">Loading users…</p>

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        {learners.length} registered learner{learners.length === 1 ? '' : 's'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {learners.map((l) => (
          <div key={l.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy truncate">{l.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{l.phone}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {l.school} · {l.country}
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  Joined {new Date(l.createdAt).toLocaleDateString()}
                </p>
              </div>
              {l.isDisabled && (
                <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                  DISABLED
                </span>
              )}
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => handleToggleDisabled(l)}
                disabled={busyId === l.id}
                className={`mt-2 text-xs font-medium disabled:opacity-50 ${
                  l.isDisabled ? 'text-brand-green' : 'text-red-500'
                }`}
              >
                {busyId === l.id ? 'Updating…' : l.isDisabled ? 'Enable Account' : 'Disable Account'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- Analytics tab ----------------

function AnalyticsTab({ demoMode, courses }: { demoMode: boolean; courses: Course[] }) {
  const [learners, setLearners] = useState<api.AdminLearnerRow[]>([])
  const [enrollments, setEnrollments] = useState<api.AdminEnrollmentRow[]>([])
  const [loading, setLoading] = useState(!demoMode)

  useEffect(() => {
    if (demoMode) return
    Promise.all([api.fetchAllLearnersAdmin(), api.fetchAllEnrollmentsAdmin()]).then(([l, e]) => {
      setLearners(l)
      setEnrollments(e)
      setLoading(false)
    })
  }, [demoMode])

  const perCourse = useMemo(() => {
    return courses.map((c) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === c.id)
      return {
        id: c.id,
        title: c.title,
        enrolled: courseEnrollments.length,
        completed: courseEnrollments.filter((e) => e.completed).length,
      }
    }).sort((a, b) => b.enrolled - a.enrolled)
  }, [enrollments, courses])

  if (demoMode) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        Analytics require a shared backend. Connect Supabase (see README) to see real usage data.
      </p>
    )
  }

  if (loading) return <p className="text-sm text-gray-400 text-center mt-10">Loading analytics…</p>

  const totalCompletions = enrollments.filter((e) => e.completed).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Total Learners" value={learners.length} />
        <StatBox label="Total Enrollments" value={enrollments.length} />
        <StatBox label="Completions" value={totalCompletions} />
        <StatBox label="Courses" value={courses.length} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-navy mb-2">Most Popular Courses</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {perCourse.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-navy">{c.title}</p>
              <p className="text-xs text-gray-500">
                {c.enrolled} enrolled · {c.completed} completed
              </p>
            </div>
          ))}
          {perCourse.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No course data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

// ---------------- Admins tab (super_admin only) ----------------

const PERMISSION_OPTIONS = [
  { key: 'certificates', label: 'Certificates' },
  { key: 'users', label: 'Users' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'content', label: 'Courses (Content)' },
]

function AdminsTab({
  demoMode,
  currentAdminId,
  isSuperAdmin,
}: {
  demoMode: boolean
  currentAdminId?: string
  isSuperAdmin: boolean
}) {
  const [admins, setAdmins] = useState<api.AdminRow[]>([])
  const [loading, setLoading] = useState(!demoMode)
  const [showForm, setShowForm] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
  const [perms, setPerms] = useState<string[]>(['certificates', 'users', 'analytics'])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadAll() {
    setLoading(true)
    setAdmins(await api.fetchAllAdmins())
    setLoading(false)
  }

  useEffect(() => {
    if (!demoMode) loadAll()
  }, [demoMode])

  if (!isSuperAdmin) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        Only super admins can manage other admins.
      </p>
    )
  }

  if (demoMode) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        Admin management requires a shared backend. Connect Supabase (see README) to invite other
        people to help run the app.
      </p>
    )
  }

  function togglePerm(key: string) {
    setPerms((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]))
  }

  function resetForm() {
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('admin')
    setPerms(['certificates', 'users', 'analytics'])
    setError('')
  }

  async function handleCreate() {
    setError('')
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError('Fill in name, email, and a password of at least 6 characters.')
      return
    }
    setSubmitting(true)
    const res = await api.createAdminAccount(fullName, email, password, role, perms)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error || 'Could not create admin account.')
      return
    }
    resetForm()
    setShowForm(false)
    await loadAll()
  }

  async function handleRemove(adminId: string) {
    if (adminId === currentAdminId) return
    if (!confirm('Remove this admin? They will no longer be able to log in at all.')) return
    const res = await api.removeAdmin(adminId)
    if (!res.ok) {
      alert(res.error || 'Could not remove admin.')
      return
    }
    await loadAll()
  }

  return (
    <div className="space-y-5">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-green text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
        >
          <Plus size={16} />
          Add New Admin
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-navy">Add New Admin</h3>
            <button onClick={() => { setShowForm(false); resetForm() }}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

          <label className="text-xs font-medium text-gray-600">Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input mt-1 mb-3" />

          <label className="text-xs font-medium text-gray-600">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1 mb-3" />

          <label className="text-xs font-medium text-gray-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1 mb-3"
            placeholder="They can change this after logging in"
          />

          <label className="text-xs font-medium text-gray-600 block mb-1.5">Role</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg border ${
                role === 'admin' ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-500'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setRole('super_admin')}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg border ${
                role === 'super_admin' ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-500'
              }`}
            >
              Super Admin
            </button>
          </div>

          {role === 'admin' && (
            <div className="mb-3">
              <p className="text-[10px] text-gray-400 mb-1.5">PERMISSIONS</p>
              <div className="flex flex-wrap gap-2">
                {PERMISSION_OPTIONS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => togglePerm(p.key)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                      perms.includes(p.key)
                        ? 'bg-brand-green/10 border-brand-green text-brand-green'
                        : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Admin Account'}
          </button>
          <p className="text-[10px] text-gray-400 mt-2">
            They'll log in with this email and password right away, then can update their own
            profile from there.
          </p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-navy mb-2">Current Admins</h3>
        {loading && <p className="text-sm text-gray-400 text-center mt-6">Loading…</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {admins.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{a.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{a.email}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    a.role === 'super_admin' ? 'bg-gold/20 text-gold' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {a.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                </span>
              </div>
              {a.role === 'admin' && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Permissions: {a.permissions.join(', ') || 'none'}
                </p>
              )}
              {a.id !== currentAdminId ? (
                <button
                  onClick={() => handleRemove(a.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium"
                >
                  <Trash2 size={12} />
                  Remove Admin
                </button>
              ) : (
                <p className="mt-2 text-[10px] text-gray-300">This is you</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------- Courses tab (content admins) ----------------

const CATEGORY_OPTIONS = [
  'Teaching & Pedagogy',
  'Lesson Planning',
  'Classroom Management',
  'School Administration',
  'School Financial Management',
  'Educational Technology',
  'Teacher Professional Development',
]

function CoursesTab({
  demoMode,
  courses,
  refreshCourses,
}: {
  demoMode: boolean
  courses: Course[]
  refreshCourses: () => Promise<void>
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  if (demoMode) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        Course management requires a shared backend. Connect Supabase (see README) so course
        edits are saved for real instead of just the built-in demo content.
      </p>
    )
  }

  const selected = courses.find((c) => c.id === selectedId)

  if (selected) {
    return <CourseEditor course={selected} onBack={() => setSelectedId(null)} onChanged={refreshCourses} />
  }

  if (creating) {
    return (
      <NewCourseForm
        onCancel={() => setCreating(false)}
        onCreated={async (id) => {
          await refreshCourses()
          setCreating(false)
          setSelectedId(id)
        }}
      />
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setCreating(true)}
        className="flex items-center gap-2 bg-brand-green text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
      >
        <Plus size={16} />
        Add Course
      </button>

      {courses.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">No courses yet. Create your first one above.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {courses.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <span className="text-[10px] uppercase tracking-wide text-brand-green font-semibold">
              {c.category}
            </span>
            <p className="font-semibold text-navy mt-0.5">{c.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {c.lessons.length} lesson{c.lessons.length === 1 ? '' : 's'} · {c.finalAssessment.length} final
              question{c.finalAssessment.length === 1 ? '' : 's'}
            </p>
            <button
              onClick={() => setSelectedId(c.id)}
              className="mt-3 flex items-center gap-1 text-xs text-navy font-semibold"
            >
              <Pencil size={12} />
              Update Course
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewCourseForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    if (!title.trim()) {
      setError('Enter a course title.')
      return
    }
    setSubmitting(true)
    const res = await api.createCourse({ title, category, description })
    setSubmitting(false)
    if (!res.ok || !res.id) {
      setError(res.error || 'Could not create course.')
      return
    }
    onCreated(res.id)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy">New Course</h3>
        <button onClick={onCancel}>
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <label className="text-xs font-medium text-gray-600">Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1 mb-3" />
      <label className="text-xs font-medium text-gray-600">Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1 mb-3">
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <label className="text-xs font-medium text-gray-600">Description</label>
      <p className="text-[10px] text-gray-400 mb-1">
        Same formatting as lesson content: blank line = new paragraph, "# "/"## " = heading,
        **term** = gold highlight.
      </p>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input mt-1 mb-3" rows={3} />
      <button
        onClick={handleCreate}
        disabled={submitting}
        className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create Course'}
      </button>
    </div>
  )
}

function CourseEditor({
  course,
  onBack,
  onChanged,
}: {
  course: Course
  onBack: () => void
  onChanged: () => Promise<void>
}) {
  const [editingDetails, setEditingDetails] = useState(false)
  const [title, setTitle] = useState(course.title)
  const [category, setCategory] = useState(course.category)
  const [description, setDescription] = useState(course.description)
  const [savingDetails, setSavingDetails] = useState(false)

  const [addingLesson, setAddingLesson] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  async function handleSaveDetails() {
    setSavingDetails(true)
    await api.updateCourse(course.id, { title, category, description })
    setSavingDetails(false)
    setEditingDetails(false)
    await onChanged()
  }

  async function handleDeleteCourse() {
    if (!confirm(`Delete "${course.title}" and all its lessons? This can't be undone.`)) return
    await api.deleteCourse(course.id)
    await onChanged()
    onBack()
  }

  async function moveLesson(lesson: Lesson, direction: -1 | 1) {
    const idx = course.lessons.findIndex((l) => l.id === lesson.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= course.lessons.length) return
    const other = course.lessons[swapIdx]
    await Promise.all([
      api.updateLessonPosition(lesson.id, swapIdx + 1),
      api.updateLessonPosition(other.id, idx + 1),
    ])
    await onChanged()
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson and its quiz questions?')) return
    await api.deleteLesson(lessonId)
    await onChanged()
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Delete this final assessment question?')) return
    await api.deleteFinalQuestion(questionId)
    await onChanged()
  }

  const selectedLesson = course.lessons.find((l) => l.id === selectedLessonId)
  const editingQuestion = course.finalAssessment.find((q) => q.id === editingQuestionId)

  if (selectedLesson) {
    return (
      <LessonEditor
        lesson={selectedLesson}
        onBack={() => setSelectedLessonId(null)}
        onChanged={onChanged}
      />
    )
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs text-gray-400 font-medium">
        ← Back to Courses
      </button>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-2xl">
        {editingDetails ? (
          <>
            <label className="text-xs font-medium text-gray-600">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1 mb-3" />
            <label className="text-xs font-medium text-gray-600">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1 mb-3">
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="text-xs font-medium text-gray-600">Description</label>
            <p className="text-[10px] text-gray-400 mb-1">
              Same formatting as lesson content: blank line = new paragraph, "# "/"## " = heading,
              **term** = gold highlight.
            </p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input mt-1 mb-3" rows={3} />
            <div className="flex gap-2">
              <button onClick={handleSaveDetails} disabled={savingDetails} className="flex-1 bg-brand-green text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50">
                Save
              </button>
              <button onClick={() => setEditingDetails(false)} className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wide text-brand-green font-semibold">{course.category}</span>
                <h2 className="font-bold text-navy mt-0.5 text-lg">{course.title}</h2>
              </div>
              <button
                onClick={() => setEditingDetails(true)}
                className="flex items-center gap-1 text-xs text-navy font-semibold"
              >
                <Pencil size={14} />
                Update Course
              </button>
            </div>
            <LessonContent text={course.description} className="mt-2" />
            <button onClick={handleDeleteCourse} className="mt-3 flex items-center gap-1 text-xs text-red-500 font-medium">
              <Trash2 size={12} />
              Delete Course
            </button>
          </>
        )}
      </div>

      {/* ---------- Lessons ---------- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-navy">Lessons ({course.lessons.length})</h3>
          <button onClick={() => setAddingLesson(true)} className="flex items-center gap-1 text-xs text-brand-green font-semibold">
            <Plus size={14} />
            Add Lesson
          </button>
        </div>

        {addingLesson && (
          <LessonForm
            onCancel={() => setAddingLesson(false)}
            onSave={async (data) => {
              await api.createLesson(course.id, course.lessons.length + 1, data)
              await onChanged()
              setAddingLesson(false)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {course.lessons.map((l, i) => (
            <div key={l.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="flex flex-col">
                <button onClick={() => moveLesson(l, -1)} disabled={i === 0} className="disabled:opacity-20">
                  <ChevronUp size={14} className="text-gray-400" />
                </button>
                <button onClick={() => moveLesson(l, 1)} disabled={i === course.lessons.length - 1} className="disabled:opacity-20">
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Lesson {i + 1}</p>
                <p className="text-sm font-medium text-navy truncate">{l.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {l.quizzes.length} quiz question{l.quizzes.length === 1 ? '' : 's'}
                </p>
              </div>
              <button onClick={() => setSelectedLessonId(l.id)}>
                <Pencil size={14} className="text-gray-400" />
              </button>
              <button onClick={() => handleDeleteLesson(l.id)}>
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Final Assessment ---------- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-navy">
            Final Assessment ({course.finalAssessment.length} / ~20 questions)
          </h3>
          <button onClick={() => setAddingQuestion(true)} className="flex items-center gap-1 text-xs text-brand-green font-semibold">
            <Plus size={14} />
            Add Question
          </button>
        </div>

        {addingQuestion && (
          <QuestionForm
            title="New Final Assessment Question"
            onCancel={() => setAddingQuestion(false)}
            onSave={async (data) => {
              await api.createFinalQuestion(course.id, course.finalAssessment.length + 1, data)
              await onChanged()
              setAddingQuestion(false)
            }}
          />
        )}

        {editingQuestion && (
          <QuestionForm
            title="Edit Question"
            initial={editingQuestion}
            onCancel={() => setEditingQuestionId(null)}
            onSave={async (data) => {
              await api.updateFinalQuestion(editingQuestion.id, data)
              await onChanged()
              setEditingQuestionId(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {course.finalAssessment.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-navy flex-1">
                  {i + 1}. {q.question}
                </p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingQuestionId(q.id)}>
                    <Pencil size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)}>
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------- Lesson editor (fields + its quiz question list) ----------------

function LessonEditor({
  lesson,
  onBack,
  onChanged,
}: {
  lesson: Lesson
  onBack: () => void
  onChanged: () => Promise<void>
}) {
  const [editingFields, setEditingFields] = useState(false)
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  async function handleDeleteQuestion(quizId: string) {
    if (!confirm('Delete this quiz question?')) return
    await api.deleteLessonQuizQuestion(quizId)
    await onChanged()
  }

  const editingQuestion = lesson.quizzes.find((q) => q.id === editingQuestionId)

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs text-gray-400 font-medium">
        ← Back to Lessons
      </button>

      {editingFields ? (
        <LessonForm
          initial={lesson}
          onCancel={() => setEditingFields(false)}
          onSave={async (data) => {
            await api.updateLessonFields(lesson.id, data)
            await onChanged()
            setEditingFields(false)
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-2xl">
          <div className="flex items-start justify-between">
            <h2 className="font-bold text-navy text-lg">{lesson.title}</h2>
            <button onClick={() => setEditingFields(true)} className="flex items-center gap-1 text-xs text-navy font-semibold shrink-0">
              <Pencil size={14} />
              Edit Lesson
            </button>
          </div>
          <LessonContent text={lesson.content} className="mt-2" />
          {lesson.videoUrl && <p className="text-xs text-gray-400 mt-2">Video: {lesson.videoUrl}</p>}
          {lesson.photos[0] && (
            <img src={lesson.photos[0]} alt="" className="w-full max-w-xs h-32 object-cover rounded-lg mt-3" />
          )}
          {lesson.resources.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] text-gray-400 mb-1">GOOGLE DRIVE FILES</p>
              {lesson.resources.map((r) => (
                <p key={r.name} className="text-xs text-gray-500">
                  {r.name} — {r.url}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-navy">
            Quiz Questions ({lesson.quizzes.length} / ~10)
          </h3>
          <button onClick={() => setAddingQuestion(true)} className="flex items-center gap-1 text-xs text-brand-green font-semibold">
            <Plus size={14} />
            Add Question
          </button>
        </div>

        {addingQuestion && (
          <QuestionForm
            title="New Quiz Question"
            onCancel={() => setAddingQuestion(false)}
            onSave={async (data) => {
              await api.createLessonQuizQuestion(lesson.id, lesson.quizzes.length + 1, data)
              await onChanged()
              setAddingQuestion(false)
            }}
          />
        )}

        {editingQuestion && (
          <QuestionForm
            title="Edit Question"
            initial={editingQuestion}
            onCancel={() => setEditingQuestionId(null)}
            onSave={async (data) => {
              await api.updateLessonQuizQuestion(editingQuestion.id, data)
              await onChanged()
              setEditingQuestionId(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {lesson.quizzes.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-navy flex-1">
                  {i + 1}. {q.question}
                </p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingQuestionId(q.id)}>
                    <Pencil size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)}>
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {lesson.quizzes.length === 0 && (
            <p className="text-sm text-gray-400">No quiz questions yet -- this lesson has no gate to pass.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Shared quiz-field editor used by both lesson quiz questions and final
// assessment questions, so the option/correct-answer UI stays consistent.
function QuizFields({
  question,
  setQuestion,
  options,
  setOptions,
  correctIndex,
  setCorrectIndex,
  explanation,
  setExplanation,
}: {
  question: string
  setQuestion: (v: string) => void
  options: string[]
  setOptions: (v: string[]) => void
  correctIndex: number
  setCorrectIndex: (v: number) => void
  explanation: string
  setExplanation: (v: string) => void
}) {
  return (
    <>
      <label className="text-xs font-medium text-gray-600">Question</label>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} className="input mt-1 mb-3" />
      <label className="text-xs font-medium text-gray-600">Options (tap the correct one)</label>
      <div className="space-y-2 mt-1 mb-3">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setCorrectIndex(i)}
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                correctIndex === i ? 'bg-brand-green border-brand-green text-white' : 'border-gray-300 text-gray-400'
              }`}
            >
              {String.fromCharCode(65 + i)}
            </button>
            <input
              value={opt}
              onChange={(e) => {
                const next = [...options]
                next[i] = e.target.value
                setOptions(next)
              }}
              className="input flex-1"
            />
          </div>
        ))}
      </div>
      <label className="text-xs font-medium text-gray-600">Explanation (shown after a correct answer)</label>
      <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} className="input mt-1 mb-3" rows={2} />
    </>
  )
}

function LessonForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Lesson
  onCancel: () => void
  onSave: (data: api.LessonFieldsInput) => Promise<void>
}) {
  const [lessonTitle, setLessonTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [practicalExample, setPracticalExample] = useState(initial?.practicalExample || '')
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl || '')
  const [coverPhoto, setCoverPhoto] = useState((initial?.photos || [])[0] || '')
  const [resourcesText, setResourcesText] = useState(
    (initial?.resources || []).map((r) => `${r.name} | ${r.url}`).join('\n')
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!lessonTitle.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    const resources = resourcesText
      .split('\n')
      .map((line) => line.split('|').map((s) => s.trim()))
      .filter(([name, url]) => name && url)
      .map(([name, url]) => ({ name, url }))
    const photos = coverPhoto.trim() ? [coverPhoto.trim()] : []

    setSubmitting(true)
    await onSave({
      title: lessonTitle,
      content,
      practicalExample,
      videoUrl: videoUrl || undefined,
      photos,
      resources,
    })
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-3 max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-navy">{initial ? 'Edit Lesson' : 'New Lesson'}</h4>
        <button onClick={onCancel}>
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <label className="text-xs font-medium text-gray-600">Lesson Title</label>
      <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="input mt-1 mb-3" />

      <label className="text-xs font-medium text-gray-600">YouTube Video Link (optional)</label>
      <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input mt-1 mb-3" placeholder="https://www.youtube.com/watch?v=..." />

      <label className="text-xs font-medium text-gray-600">Cover Photo URL (optional, shown under the video)</label>
      <input value={coverPhoto} onChange={(e) => setCoverPhoto(e.target.value)} className="input mt-1 mb-3" placeholder="https://..." />

      <label className="text-xs font-medium text-gray-600">Lesson Content (text)</label>
      <p className="text-[10px] text-gray-400 mb-1">
        Leave a blank line between paragraphs. Start a line with "# " for a big heading or "## "
        for a smaller one. Wrap key terms in double asterisks, like **this**, to highlight them
        in gold.
      </p>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input mt-1 mb-3" rows={6} />

      <label className="text-xs font-medium text-gray-600">Practical Example</label>
      <textarea value={practicalExample} onChange={(e) => setPracticalExample(e.target.value)} className="input mt-1 mb-3" rows={2} />

      <label className="text-xs font-medium text-gray-600">Google Drive Files — one per line, as "Name | URL"</label>
      <textarea value={resourcesText} onChange={(e) => setResourcesText(e.target.value)} className="input mt-1 mb-3" rows={2} placeholder="Lesson Plan Template | https://drive.google.com/..." />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 mt-1"
      >
        {submitting ? 'Saving…' : 'Save Lesson'}
      </button>
      <p className="text-[10px] text-gray-400 mt-2">
        Quiz questions for this lesson are managed separately, after saving.
      </p>
    </div>
  )
}

function QuestionForm({
  title,
  initial,
  onCancel,
  onSave,
}: {
  title: string
  initial?: { question: string; options: string[]; correctIndex: number; explanation: string }
  onCancel: () => void
  onSave: (data: api.QuestionInput) => Promise<void>
}) {
  const [question, setQuestion] = useState(initial?.question || '')
  const [options, setOptions] = useState<string[]>(initial?.options || ['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0)
  const [explanation, setExplanation] = useState(initial?.explanation || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!question.trim() || options.some((o) => !o.trim())) {
      setError('Fill in the question and all four options.')
      return
    }
    setSubmitting(true)
    await onSave({ question, options, correctIndex, explanation })
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-3 max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-navy">{title}</h4>
        <button onClick={onCancel}>
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <QuizFields
        question={question}
        setQuestion={setQuestion}
        options={options}
        setOptions={setOptions}
        correctIndex={correctIndex}
        setCorrectIndex={setCorrectIndex}
        explanation={explanation}
        setExplanation={setExplanation}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Save Question'}
      </button>
    </div>
  )
}
