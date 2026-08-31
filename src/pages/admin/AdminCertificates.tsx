import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import * as api from '../../lib/supabaseApi'
import { COURSES } from '../../data/courses'
import TopBar from '../../components/TopBar'
import { CheckCircle2 } from 'lucide-react'

export default function AdminCertificates() {
  const { demoMode, currentUser, certRequests } = useApp()

  const [liveRequests, setLiveRequests] = useState<api.AdminCertRequest[]>([])
  const [loading, setLoading] = useState(!demoMode)
  const [issuingId, setIssuingId] = useState<string | null>(null)

  async function loadAll() {
    setLoading(true)
    const data = await api.fetchAllCertRequestsAdmin()
    setLiveRequests(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!demoMode) loadAll()
  }, [demoMode])

  // Only real admins (teachers.is_admin = true in Supabase) can reach this
  // screen once a backend is connected. In demo mode (no backend yet) it
  // stays open for testing, since there's no real admin concept locally.
  if (!demoMode && !currentUser?.isAdmin) {
    return <Navigate to="/" replace />
  }

  async function handleIssue(requestId: string) {
    if (!currentUser) return
    setIssuingId(requestId)
    await api.markCertificateIssuedRemote(requestId, currentUser.id)
    await loadAll()
    setIssuingId(null)
  }

  return (
    <div className="pb-24">
      <TopBar title="Admin · Certificate Requests" back />
      <div className="px-4 py-4 space-y-3">
        {demoMode && (
          <p className="text-xs text-gray-400">
            Demo mode: this only shows requests from the currently logged-in demo account,
            since there's no shared backend yet. Connect Supabase (see README) to see every
            teacher's requests here for real.
          </p>
        )}

        {!demoMode && loading && (
          <p className="text-sm text-gray-400 text-center mt-10">Loading requests…</p>
        )}

        {/* Demo mode list (local-only) */}
        {demoMode &&
          certRequests.map((r) => {
            const course = COURSES.find((c) => c.id === r.courseId)
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-navy">{course?.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Requested {new Date(r.requestedAt).toLocaleString()}
                </p>
                {r.transactionRef && (
                  <p className="text-xs text-gray-500 mt-1">Ref: {r.transactionRef}</p>
                )}
                <span
                  className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    r.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
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

        {/* Live mode list (every teacher, via Supabase) */}
        {!demoMode &&
          !loading &&
          liveRequests.map((r) => {
            const course = COURSES.find((c) => c.id === r.courseId)
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-navy">{course?.title ?? r.courseId}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {r.teacherName} · {r.teacherEmail}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Requested {new Date(r.requestedAt).toLocaleString()}
                </p>
                {r.transactionRef && (
                  <p className="text-xs text-gray-500 mt-1">Ref: {r.transactionRef}</p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>

                  {r.status === 'pending' && (
                    <button
                      onClick={() => handleIssue(r.id)}
                      disabled={issuingId === r.id}
                      className="flex items-center gap-1 bg-brand-green text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      {issuingId === r.id ? 'Confirming…' : 'Confirm Payment & Issue'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        {!demoMode && !loading && liveRequests.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">No certificate requests yet.</p>
        )}
      </div>
    </div>
  )
}
