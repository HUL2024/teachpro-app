import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEMO_MODE, supabase } from '../lib/supabase'
import * as api from '../lib/supabaseApi'
import type { Learner, AdminAccount, Enrollment, CertificateRequest, Course } from '../lib/types'
import { COURSES as STATIC_COURSES } from '../data/courses'
import { normalizePhoneDigits } from '../lib/phoneAuth'
import { compressImageToMaxSize } from '../lib/imageCompress'

const STORAGE_KEY = 'teachpro_demo_state_v2'

interface DemoState {
  currentUser: Learner | null
  users: Learner[]
  enrollments: Record<string, Enrollment[]> // keyed by learnerId
  certRequests: CertificateRequest[]
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parse errors
  }
  return { currentUser: null, users: [], enrollments: {}, certRequests: [] }
}

interface AppContextValue {
  demoMode: boolean
  loading: boolean
  // A signed-in person is either a learner (currentUser) or an admin
  // (currentAdmin), never both.
  currentUser: Learner | null
  currentAdmin: AdminAccount | null
  courses: Course[]
  refreshCourses: () => Promise<void>
  enrollments: Enrollment[]
  certRequests: CertificateRequest[]
  signUp: (l: Omit<Learner, 'id'>) => Promise<{ ok: boolean; error?: string }>
  logIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean }>
  logOut: () => void
  updateProfile: (patch: Partial<Learner>) => void
  uploadAvatar: (file: File) => Promise<{ ok: boolean; error?: string }>
  enroll: (courseId: string) => void
  markLessonComplete: (courseId: string, lessonId: string) => void
  recordQuizScore: (courseId: string, key: string, score: number) => void
  submitFinalAssessment: (
    courseId: string,
    score: number
  ) => Promise<{ passed: boolean; reset: boolean; attemptsLeft: number }>
  requestCertificate: (
    courseId: string,
    transactionRef?: string
  ) => Promise<{ ok: boolean; error?: string }>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // ---------- DEMO MODE (local-only, no backend configured) ----------
  const [demoState, setDemoState] = useState<DemoState>(loadState)

  useEffect(() => {
    if (DEMO_MODE) localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState))
  }, [demoState])

  // ---------- LIVE MODE (Supabase) ----------
  const [liveUser, setLiveUser] = useState<Learner | null>(null)
  const [liveAdmin, setLiveAdmin] = useState<AdminAccount | null>(null)
  const [liveEnrollments, setLiveEnrollments] = useState<Enrollment[]>([])
  const [liveCertRequests, setLiveCertRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(!DEMO_MODE)

  async function refreshLiveIdentity(userId: string) {
    const identity = await api.fetchIdentity(userId)

    if (identity?.kind === 'learner' && identity.learner.isDisabled) {
      // An admin may disable this account after the session started -- catch
      // that here rather than trusting a stale "not disabled" state.
      await api.logOut()
      setLiveUser(null)
      setLiveAdmin(null)
      setLiveEnrollments([])
      setLiveCertRequests([])
      return null
    }

    if (identity?.kind === 'admin') {
      setLiveAdmin(identity.admin)
      setLiveUser(null)
      setLiveEnrollments([])
      setLiveCertRequests([])
      return identity
    }

    if (identity?.kind === 'learner') {
      const [enr, certs] = await Promise.all([
        api.fetchEnrollments(identity.learner.id),
        api.fetchCertRequests(identity.learner.id),
      ])
      setLiveUser(identity.learner)
      setLiveAdmin(null)
      setLiveEnrollments(enr)
      setLiveCertRequests(certs)
      return identity
    }

    setLiveUser(null)
    setLiveAdmin(null)
    setLiveEnrollments([])
    setLiveCertRequests([])
    return null
  }

  useEffect(() => {
    if (DEMO_MODE) return
    let active = true
    supabase!.auth.getSession().then(async ({ data }) => {
      if (!active) return
      if (data.session?.user) await refreshLiveIdentity(data.session.user.id)
      setLoading(false)
    })
    const { data: sub } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await refreshLiveIdentity(session.user.id)
      } else {
        setLiveUser(null)
        setLiveAdmin(null)
        setLiveEnrollments([])
        setLiveCertRequests([])
      }
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // ---------- Course content ----------
  const [liveCourses, setLiveCourses] = useState<Course[]>([])

  async function refreshCourses() {
    if (DEMO_MODE) return
    setLiveCourses(await api.fetchAllCoursesFull())
  }

  useEffect(() => {
    if (!DEMO_MODE) refreshCourses()
  }, [])

  const courses = DEMO_MODE ? STATIC_COURSES : liveCourses

  // ---------- Shared derived state ----------
  const currentUser = DEMO_MODE ? demoState.currentUser : liveUser
  const currentAdmin = DEMO_MODE ? null : liveAdmin
  const enrollments = DEMO_MODE
    ? currentUser
      ? demoState.enrollments[currentUser.id] || []
      : []
    : liveEnrollments
  const certRequests = DEMO_MODE
    ? demoState.certRequests.filter((c) => c.learnerId === currentUser?.id)
    : liveCertRequests

  // ---------- Demo-mode helpers ----------
  function ensureDemoEnrollment(s: DemoState, courseId: string): Enrollment[] {
    const uid = s.currentUser!.id
    const list = s.enrollments[uid] || []
    if (list.some((e) => e.courseId === courseId)) return list
    return [
      ...list,
      {
        courseId,
        enrolledAt: new Date().toISOString(),
        completedLessonIds: [],
        lessonCompletedAt: {},
        quizScores: {},
        finalScore: null,
        completed: false,
        completedAt: null,
        failedAttempts: 0,
      },
    ]
  }

  // ---------- Public API ----------
  async function signUp(l: Omit<Learner, 'id'>): Promise<{ ok: boolean; error?: string }> {
    if (!DEMO_MODE) {
      const res = await api.signUpLearner(l as Omit<Learner, 'id'> & { password: string })
      if (!res.ok) return { ok: false, error: res.error }
      if (res.userId) await refreshLiveIdentity(res.userId)
      return { ok: true }
    }
    if (
      demoState.users.some(
        (u) => normalizePhoneDigits(u.phone) === normalizePhoneDigits(l.phone)
      )
    ) {
      return { ok: false, error: 'An account with this phone number already exists.' }
    }
    const newUser: Learner = { ...l, id: crypto.randomUUID() }
    setDemoState((s) => ({
      ...s,
      users: [...s.users, newUser],
      currentUser: newUser,
      enrollments: { ...s.enrollments, [newUser.id]: [] },
    }))
    return { ok: true }
  }

  async function logIn(
    phoneOrEmail: string,
    password: string
  ): Promise<{ ok: boolean; error?: string; isAdmin?: boolean }> {
    if (!DEMO_MODE) {
      const res = await api.logIn(phoneOrEmail, password)
      if (!res.ok || !res.userId) return { ok: false, error: res.error }
      const identity = await refreshLiveIdentity(res.userId)
      return { ok: true, isAdmin: identity?.kind === 'admin' }
    }
    const user = demoState.users.find(
      (u) =>
        normalizePhoneDigits(u.phone) === normalizePhoneDigits(phoneOrEmail) &&
        u.password === password
    )
    if (!user) return { ok: false, error: 'Invalid phone number or password.' }
    setDemoState((s) => ({ ...s, currentUser: user }))
    return { ok: true, isAdmin: false }
  }

  function logOut() {
    if (!DEMO_MODE) {
      api.logOut()
      return
    }
    setDemoState((s) => ({ ...s, currentUser: null }))
  }

  function updateProfile(patch: Partial<Learner>) {
    if (!currentUser) return
    if (!DEMO_MODE) {
      api.updateLearnerProfile(currentUser.id, patch)
      setLiveUser({ ...currentUser, ...patch })
      return
    }
    const updated = { ...currentUser, ...patch }
    setDemoState((s) => ({
      ...s,
      currentUser: updated,
      users: s.users.map((u) => (u.id === updated.id ? updated : u)),
    }))
  }

  async function uploadAvatar(file: File): Promise<{ ok: boolean; error?: string }> {
    if (!currentUser) return { ok: false, error: 'Not logged in.' }
    let compressed: Blob
    try {
      compressed = await compressImageToMaxSize(file, 300 * 1024)
    } catch {
      return { ok: false, error: 'Could not process that image. Try a different photo.' }
    }

    if (!DEMO_MODE) {
      const res = await api.uploadAvatar(currentUser.id, compressed)
      if (!res.ok || !res.url) return { ok: false, error: res.error || 'Upload failed.' }
      updateProfile({ photoUrl: res.url })
      return { ok: true }
    }

    // Demo mode has no storage backend -- use a local object URL as a
    // stand-in preview. It won't survive a page reload, which is fine for
    // demo/testing purposes only.
    const url = URL.createObjectURL(compressed)
    updateProfile({ photoUrl: url })
    return { ok: true }
  }

  function enroll(courseId: string) {
    if (!currentUser) return
    if (!DEMO_MODE) {
      api.ensureEnrollmentRow(currentUser.id, courseId).then(() => refreshLiveIdentity(currentUser.id))
      return
    }
    setDemoState((s) => ({
      ...s,
      enrollments: { ...s.enrollments, [currentUser.id]: ensureDemoEnrollment(s, courseId) },
    }))
  }

  function markLessonComplete(courseId: string, lessonId: string) {
    if (!currentUser) return
    if (!DEMO_MODE) {
      api
        .markLessonCompleteRemote(currentUser.id, courseId, lessonId)
        .then(() => refreshLiveIdentity(currentUser.id))
      return
    }
    setDemoState((s) => {
      const list = ensureDemoEnrollment(s, courseId)
      const updatedList = list.map((e) =>
        e.courseId === courseId && !e.completedLessonIds.includes(lessonId)
          ? {
              ...e,
              completedLessonIds: [...e.completedLessonIds, lessonId],
              lessonCompletedAt: { ...e.lessonCompletedAt, [lessonId]: new Date().toISOString() },
            }
          : e
      )
      return { ...s, enrollments: { ...s.enrollments, [currentUser.id]: updatedList } }
    })
  }

  function recordQuizScore(courseId: string, key: string, score: number) {
    if (!currentUser) return
    if (!DEMO_MODE) {
      api
        .recordQuizScoreRemote(currentUser.id, courseId, key, score)
        .then(() => refreshLiveIdentity(currentUser.id))
      return
    }
    setDemoState((s) => {
      const list = ensureDemoEnrollment(s, courseId)
      const updatedList = list.map((e) =>
        e.courseId === courseId ? { ...e, quizScores: { ...e.quizScores, [key]: score } } : e
      )
      return { ...s, enrollments: { ...s.enrollments, [currentUser.id]: updatedList } }
    })
  }

  async function submitFinalAssessment(
    courseId: string,
    score: number
  ): Promise<{ passed: boolean; reset: boolean; attemptsLeft: number }> {
    if (!currentUser) return { passed: false, reset: false, attemptsLeft: 0 }

    if (!DEMO_MODE) {
      const result = await api.submitFinalAssessmentRemote(currentUser.id, courseId, score)
      await refreshLiveIdentity(currentUser.id)
      return result
    }

    const passed = score >= 70
    const existing = enrollments.find((e) => e.courseId === courseId)
    const currentAttempts = existing?.failedAttempts || 0
    const reset = !passed && currentAttempts + 1 >= 2
    const attemptsLeft = passed ? 0 : reset ? 0 : Math.max(0, 2 - (currentAttempts + 1))

    setDemoState((s) => {
      const list = ensureDemoEnrollment(s, courseId)
      const updatedList = list.map((e) => {
        if (e.courseId !== courseId) return e
        if (passed) {
          return {
            ...e,
            completed: true,
            completedAt: new Date().toISOString(),
            finalScore: score,
            failedAttempts: 0,
          }
        }
        if (reset) {
          return {
            courseId,
            enrolledAt: e.enrolledAt,
            completedLessonIds: [],
            lessonCompletedAt: {},
            quizScores: {},
            finalScore: null,
            completed: false,
            completedAt: null,
            failedAttempts: 0,
          }
        }
        return { ...e, failedAttempts: currentAttempts + 1, finalScore: score }
      })
      return { ...s, enrollments: { ...s.enrollments, [currentUser.id]: updatedList } }
    })

    return { passed, reset, attemptsLeft }
  }

  async function requestCertificate(
    courseId: string,
    transactionRef?: string
  ): Promise<{ ok: boolean; error?: string }> {
    if (!currentUser) return { ok: false, error: 'Not logged in.' }
    if (!DEMO_MODE) {
      const res = await api.requestCertificateRemote(currentUser.id, courseId, transactionRef)
      if (res.ok) await refreshLiveIdentity(currentUser.id)
      return res
    }
    if (
      demoState.certRequests.some(
        (c) =>
          c.learnerId === currentUser.id &&
          c.courseId === courseId &&
          (c.status === 'pending' || c.status === 'issued')
      )
    ) {
      return { ok: false, error: 'You already have a certificate request for this course.' }
    }
    if (
      transactionRef &&
      demoState.certRequests.some((c) => c.transactionRef === transactionRef)
    ) {
      return {
        ok: false,
        error: 'This transaction reference has already been used for a certificate request.',
      }
    }
    setDemoState((s) => ({
      ...s,
      certRequests: [
        ...s.certRequests,
        {
          id: crypto.randomUUID(),
          courseId,
          learnerId: currentUser.id,
          requestedAt: new Date().toISOString(),
          status: 'pending',
          transactionRef,
        },
      ],
    }))
    return { ok: true }
  }

  return (
    <AppContext.Provider
      value={{
        demoMode: DEMO_MODE,
        loading,
        currentUser,
        currentAdmin,
        courses,
        refreshCourses,
        enrollments,
        certRequests,
        signUp,
        logIn,
        logOut,
        updateProfile,
        uploadAvatar,
        enroll,
        markLessonComplete,
        recordQuizScore,
        submitFinalAssessment,
        requestCertificate,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
