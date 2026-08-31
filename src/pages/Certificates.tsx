import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import TopBar from '../components/TopBar'
import { toDriveDownloadUrl } from '../lib/driveLink'
import { useApp } from '../context/AppContext'
import { Award, Clock, Download, Eye, Phone } from 'lucide-react'

export default function Certificates() {
  const location = useLocation()
  const { enrollments, certRequests, requestCertificate, courses } = useApp()
  const preselectCourseId = (location.state as { courseId?: string } | null)?.courseId

  const [showPayFor, setShowPayFor] = useState<string | null>(preselectCourseId || null)
  const [txnRef, setTxnRef] = useState('')
  const [txnError, setTxnError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const completed = enrollments.filter((e) => e.completed)

  function latestRequestFor(courseId: string) {
    const reqs = certRequests.filter((r) => r.courseId === courseId)
    return reqs[reqs.length - 1]
  }

  async function handleRequest(courseId: string) {
    const trimmed = txnRef.trim()
    if (!trimmed) {
      setTxnError('Enter your transaction reference or sender name before submitting.')
      return
    }
    setSubmitting(true)
    const res = await requestCertificate(courseId, trimmed)
    setSubmitting(false)
    if (!res.ok) {
      setTxnError(res.error || 'Could not submit your request.')
      return
    }
    setShowPayFor(null)
    setTxnRef('')
    setTxnError('')
  }

  return (
    <div className="pb-24">
      <TopBar title="Certificates" />
      <div className="px-4 py-4 space-y-3">
        {completed.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">
            Complete a course to become eligible for a certificate.
          </p>
        )}

        {completed.map((e) => {
          const course = courses.find((c) => c.id === e.courseId)
          if (!course) return null
          const request = latestRequestFor(course.id)
          const status = request?.status || 'not_requested'

          return (
            <div key={course.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-gold/15 rounded-xl p-2.5">
                  <Award size={20} className="text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-navy text-sm truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">Final Score: {e.finalScore}%</p>
                </div>
              </div>

              <div className="mt-3">
                {status === 'not_requested' && (
                  <button
                    onClick={() => setShowPayFor(course.id)}
                    className="w-full bg-gold text-navy font-semibold py-2.5 rounded-lg text-sm"
                  >
                    Request Certificate
                  </button>
                )}
                {status === 'pending' && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                    <Clock size={16} />
                    Payment submitted — pending admin confirmation. Your certificate will be
                    sent to you in the app once confirmed.
                  </div>
                )}
                {status === 'issued' && request?.certificateUrl && (
                  <div className="flex gap-2">
                    <a
                      href={request.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </a>
                    <a
                      href={toDriveDownloadUrl(request.certificateUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-navy text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                )}
                {status === 'issued' && !request?.certificateUrl && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Marked issued, but no certificate link was attached yet — check back soon.
                  </p>
                )}
              </div>

              {showPayFor === course.id && status === 'not_requested' && (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-navy mb-1">How to pay</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Certificates are issued after manual payment confirmation. Send your
                    certificate fee via Mobile Money to the number below, then enter your
                    transaction reference / sender name so an admin can confirm it.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-navy">
                    <Phone size={14} />
                    +231 88 852 4563 (TeachPro)
                  </div>
                  <input
                    value={txnRef}
                    onChange={(e) => {
                      setTxnRef(e.target.value)
                      if (txnError) setTxnError('')
                    }}
                    placeholder="Transaction reference or sender name"
                    className="input mt-2"
                  />
                  {txnError && <p className="text-xs text-red-600 mt-1">{txnError}</p>}
                  <button
                    onClick={() => handleRequest(course.id)}
                    disabled={!txnRef.trim() || submitting}
                    className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm mt-2 disabled:opacity-40"
                  >
                    {submitting ? 'Submitting…' : "I've Sent Payment — Submit"}
                  </button>
                  <p className="text-[10px] text-gray-400 mt-2">
                    An admin will manually confirm your payment and send your certificate
                    through the app. No online verification is required.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
