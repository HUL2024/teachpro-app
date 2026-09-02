import { supabase } from './supabase'
import type { Learner, AdminAccount, Enrollment, CertificateRequest, Course } from './types'
import { phoneToAuthEmail, loginInputToAuthEmail, normalizePhoneDigits } from './phoneAuth'

// ============================================================
// Identity: a signed-in person is either a Learner or an AdminAccount,
// never both. Admins have no row in `learners` at all, so they can never
// be counted as a learner anywhere in the app.
// ============================================================

function rowToLearner(row: any): Learner {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth ?? undefined,
    country: row.country,
    school: row.school,
    subject: row.subject ?? undefined,
    level: row.level ?? undefined,
    yearsExperience: row.years_experience ?? undefined,
    bio: row.bio ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    isDisabled: row.is_disabled ?? false,
  }
}

function rowToAdmin(row: any): AdminAccount {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    permissions: row.role === 'super_admin'
      ? ['certificates', 'users', 'analytics', 'content', 'manage_admins']
      : row.permissions || [],
  }
}

export type Identity =
  | { kind: 'admin'; admin: AdminAccount }
  | { kind: 'learner'; learner: Learner }
  | null

// Checks the admins table first, then falls back to learners. This is the
// one place that decides "who is this person" after any login/session
// restore.
export async function fetchIdentity(userId: string): Promise<Identity> {
  const { data: adminRow } = await supabase!.from('admins').select('*').eq('id', userId).maybeSingle()
  if (adminRow) return { kind: 'admin', admin: rowToAdmin(adminRow) }

  const { data: learnerRow } = await supabase!
    .from('learners')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (learnerRow) return { kind: 'learner', learner: rowToLearner(learnerRow) }

  return null
}

// ---------- Auth ----------

export async function signUpLearner(
  l: Omit<Learner, 'id'> & { password: string }
): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const authEmail = phoneToAuthEmail(l.phone)
  const { data, error } = await supabase!.auth.signUp({ email: authEmail, password: l.password })
  if (error) {
    // A duplicate internal email means this phone number is already
    // registered.
    if (error.message.toLowerCase().includes('already registered')) {
      return { ok: false, error: 'An account with this phone number already exists.' }
    }
    return { ok: false, error: error.message }
  }
  const userId = data.user?.id
  if (!userId) {
    return {
      ok: false,
      error: 'Something went wrong creating your account. Please try again.',
    }
  }
  const { error: profileError } = await supabase!.from('learners').insert({
    id: userId,
    full_name: l.fullName,
    email: authEmail,
    phone: normalizePhoneDigits(l.phone),
    date_of_birth: l.dateOfBirth || null,
    country: l.country,
    school: l.school,
  })
  if (profileError) {
    if (profileError.message.toLowerCase().includes('duplicate')) {
      return { ok: false, error: 'An account with this phone number already exists.' }
    }
    return { ok: false, error: profileError.message }
  }
  return { ok: true, userId }
}

export async function logIn(
  phoneOrEmail: string,
  password: string
): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const authEmail = loginInputToAuthEmail(phoneOrEmail)
  const { data, error } = await supabase!.auth.signInWithPassword({ email: authEmail, password })
  if (error) return { ok: false, error: 'Incorrect phone number/email or password.' }

  const identity = await fetchIdentity(data.user.id)
  if (identity?.kind === 'learner' && identity.learner.isDisabled) {
    await supabase!.auth.signOut()
    return { ok: false, error: 'This account has been disabled. Contact your administrator.' }
  }

  return { ok: true, userId: data.user.id }
}

export async function logOut() {
  await supabase!.auth.signOut()
}

export async function updateLearnerProfile(userId: string, patch: Partial<Learner>) {
  const payload: Record<string, unknown> = {}
  if (patch.fullName !== undefined) payload.full_name = patch.fullName
  if (patch.phone !== undefined) payload.phone = patch.phone
  if (patch.school !== undefined) payload.school = patch.school
  if (patch.subject !== undefined) payload.subject = patch.subject
  if (patch.bio !== undefined) payload.bio = patch.bio
  if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl
  await supabase!.from('learners').update(payload).eq('id', userId)
}

// ---------- Forgot password (phone + birth year, no email/SMS needed) ----------

export type ResetVerifyResult = 'match' | 'no_match' | 'rate_limited' | 'error'

export async function verifyResetIdentity(
  phone: string,
  birthYear: number
): Promise<ResetVerifyResult> {
  const { data, error } = await supabase!.rpc('verify_reset_identity', {
    p_phone: normalizePhoneDigits(phone),
    p_birth_year: birthYear,
  })
  if (error) return 'error'
  return (data as ResetVerifyResult) ?? 'error'
}

export async function resetLearnerPassword(
  phone: string,
  birthYear: number,
  newPassword: string
): Promise<{ ok: boolean; error?: string; rateLimited?: boolean }> {
  const { data, error } = await supabase!.rpc('reset_learner_password', {
    p_phone: normalizePhoneDigits(phone),
    p_birth_year: birthYear,
    p_new_password: newPassword,
  })
  if (error) return { ok: false, error: error.message }
  if (data === 'rate_limited') {
    return {
      ok: false,
      rateLimited: true,
      error: 'Too many attempts. Please try again in 24 hours, or contact an administrator.',
    }
  }
  if (data !== 'success') {
    return { ok: false, error: 'Phone number and year of birth do not match our records.' }
  }
  return { ok: true }
}

// ---------- Profile photo upload ----------

export async function uploadAvatar(userId: string, blob: Blob): Promise<{ ok: boolean; url?: string; error?: string }> {
  const path = `${userId}/avatar.jpg`
  const { error: uploadError } = await supabase!.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
  if (uploadError) return { ok: false, error: uploadError.message }

  const { data } = supabase!.storage.from('avatars').getPublicUrl(path)
  // Cache-bust so the new photo shows immediately instead of a stale
  // browser-cached copy at the same URL.
  const url = `${data.publicUrl}?t=${Date.now()}`
  return { ok: true, url }
}

// ---------- Enrollments / certificates (learner-facing) ----------

function rowToEnrollment(row: any): Enrollment {
  return {
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    completedLessonIds: row.completed_lesson_ids || [],
    lessonCompletedAt: row.lesson_completed_at || {},
    quizScores: row.quiz_scores || {},
    finalScore: row.final_score,
    completed: row.completed,
    completedAt: row.completed_at,
    failedAttempts: row.failed_attempts || 0,
  }
}

function rowToCertRequest(row: any): CertificateRequest {
  return {
    id: row.id,
    courseId: row.course_id,
    learnerId: row.learner_id,
    requestedAt: row.requested_at,
    status: row.status,
    transactionRef: row.transaction_ref ?? undefined,
    issuedAt: row.issued_at ?? undefined,
    certificateUrl: row.certificate_url ?? undefined,
  }
}

export async function fetchEnrollments(learnerId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase!.from('enrollments').select('*').eq('learner_id', learnerId)
  if (error || !data) return []
  return data.map(rowToEnrollment)
}

export async function fetchCertRequests(learnerId: string): Promise<CertificateRequest[]> {
  const { data, error } = await supabase!
    .from('certificate_requests')
    .select('*')
    .eq('learner_id', learnerId)
  if (error || !data) return []
  return data.map(rowToCertRequest)
}

export async function ensureEnrollmentRow(learnerId: string, courseId: string) {
  const { data } = await supabase!
    .from('enrollments')
    .select('*')
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
    .maybeSingle()
  if (data) return rowToEnrollment(data)
  const { data: inserted } = await supabase!
    .from('enrollments')
    .insert({ learner_id: learnerId, course_id: courseId })
    .select()
    .single()
  return rowToEnrollment(inserted)
}

export async function markLessonCompleteRemote(learnerId: string, courseId: string, lessonId: string) {
  const current = await ensureEnrollmentRow(learnerId, courseId)
  if (current.completedLessonIds.includes(lessonId)) return
  const updated = [...current.completedLessonIds, lessonId]
  const updatedTimestamps = { ...current.lessonCompletedAt, [lessonId]: new Date().toISOString() }
  await supabase!
    .from('enrollments')
    .update({ completed_lesson_ids: updated, lesson_completed_at: updatedTimestamps })
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
}

export async function recordQuizScoreRemote(
  learnerId: string,
  courseId: string,
  key: string,
  score: number
) {
  const current = await ensureEnrollmentRow(learnerId, courseId)
  const updated = { ...current.quizScores, [key]: score }
  await supabase!
    .from('enrollments')
    .update({ quiz_scores: updated })
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
}

export async function submitFinalAssessmentRemote(
  learnerId: string,
  courseId: string,
  score: number
): Promise<{ passed: boolean; reset: boolean; attemptsLeft: number }> {
  const current = await ensureEnrollmentRow(learnerId, courseId)
  const passed = score >= 70
  const currentAttempts = current.failedAttempts || 0
  const reset = !passed && currentAttempts + 1 >= 2
  const attemptsLeft = passed ? 0 : reset ? 0 : Math.max(0, 2 - (currentAttempts + 1))

  if (passed) {
    await supabase!
      .from('enrollments')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        final_score: score,
        failed_attempts: 0,
      })
      .eq('learner_id', learnerId)
      .eq('course_id', courseId)
  } else if (reset) {
    await supabase!
      .from('enrollments')
      .update({
        completed_lesson_ids: [],
        lesson_completed_at: {},
        quiz_scores: {},
        final_score: null,
        completed: false,
        completed_at: null,
        failed_attempts: 0,
      })
      .eq('learner_id', learnerId)
      .eq('course_id', courseId)
  } else {
    await supabase!
      .from('enrollments')
      .update({ failed_attempts: currentAttempts + 1, final_score: score })
      .eq('learner_id', learnerId)
      .eq('course_id', courseId)
  }

  return { passed, reset, attemptsLeft }
}

export async function requestCertificateRemote(
  learnerId: string,
  courseId: string,
  transactionRef?: string
): Promise<{ ok: boolean; error?: string }> {
  // Block a second request for the same course while one is already
  // pending or issued -- stops accidental double-submission.
  const { data: existing } = await supabase!
    .from('certificate_requests')
    .select('id, status')
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
    .in('status', ['pending', 'issued'])
    .maybeSingle()
  if (existing) {
    return {
      ok: false,
      error:
        existing.status === 'issued'
          ? 'You already have a certificate for this course.'
          : 'You already have a certificate request pending for this course.',
    }
  }

  const { error } = await supabase!.from('certificate_requests').insert({
    learner_id: learnerId,
    course_id: courseId,
    transaction_ref: transactionRef,
  })

  if (error) {
    // Postgres unique_violation -- this transaction reference was already
    // used on a different certificate request (by anyone).
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'This transaction reference has already been used for a certificate request.',
      }
    }
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

// ---------- Course content (read for everyone, write for 'content' admins) ----------

export async function fetchAllCoursesFull(): Promise<Course[]> {
  const [{ data: courseRows }, { data: lessonRows }, { data: quizRows }, { data: faRows }] =
    await Promise.all([
      supabase!.from('courses').select('*').order('created_at', { ascending: true }),
      supabase!.from('lessons').select('*').order('position', { ascending: true }),
      supabase!.from('quizzes').select('*').order('position', { ascending: true }),
      supabase!
        .from('final_assessment_questions')
        .select('*')
        .order('position', { ascending: true }),
    ])

  if (!courseRows) return []

  const quizzesByLesson = new Map<string, any[]>()
  ;(quizRows || []).forEach((q: any) => {
    const list = quizzesByLesson.get(q.lesson_id) || []
    list.push(q)
    quizzesByLesson.set(q.lesson_id, list)
  })

  return courseRows.map((c: any) => {
    const lessons = (lessonRows || [])
      .filter((l: any) => l.course_id === c.id)
      .map((l: any) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.video_url ?? undefined,
        content: l.content,
        practicalExample: l.practical_example,
        photos: l.photos || [],
        resources: l.resources || [],
        quizzes: (quizzesByLesson.get(l.id) || []).map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correct_index,
          explanation: q.explanation,
        })),
      }))

    const finalAssessment = (faRows || [])
      .filter((q: any) => q.course_id === c.id)
      .map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
      }))

    return {
      id: c.id,
      title: c.title,
      category: c.category,
      description: c.description || '',
      isDemo: false,
      lessons,
      finalAssessment,
    }
  })
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

export async function createCourse(data: {
  title: string
  category: string
  description: string
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const id = slugify(data.title)
  const { error } = await supabase!.from('courses').insert({
    id,
    title: data.title,
    category: data.category,
    description: data.description,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, id }
}

export async function updateCourse(
  courseId: string,
  data: { title: string; category: string; description: string }
) {
  await supabase!
    .from('courses')
    .update({ title: data.title, category: data.category, description: data.description })
    .eq('id', courseId)
}

export async function deleteCourse(courseId: string) {
  await supabase!.from('courses').delete().eq('id', courseId)
}

export interface LessonFieldsInput {
  title: string
  content: string
  practicalExample: string
  videoUrl?: string
  photos: string[]
  resources: { name: string; url: string }[]
}

export async function createLesson(courseId: string, nextPosition: number, data: LessonFieldsInput) {
  const { data: lessonRow, error } = await supabase!
    .from('lessons')
    .insert({
      course_id: courseId,
      position: nextPosition,
      title: data.title,
      content: data.content,
      practical_example: data.practicalExample,
      video_url: data.videoUrl || null,
      photos: data.photos,
      resources: data.resources,
    })
    .select()
    .single()
  if (error || !lessonRow) return { ok: false as const, error: error?.message }
  return { ok: true as const, id: lessonRow.id as string }
}

export async function updateLessonFields(lessonId: string, data: LessonFieldsInput) {
  await supabase!
    .from('lessons')
    .update({
      title: data.title,
      content: data.content,
      practical_example: data.practicalExample,
      video_url: data.videoUrl || null,
      photos: data.photos,
      resources: data.resources,
    })
    .eq('id', lessonId)
}

export async function deleteLesson(lessonId: string) {
  await supabase!.from('lessons').delete().eq('id', lessonId)
}

export async function updateLessonPosition(lessonId: string, position: number) {
  await supabase!.from('lessons').update({ position }).eq('id', lessonId)
}

export interface QuestionInput {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

// Lesson quiz questions (many per lesson, up to ~10)
export async function createLessonQuizQuestion(
  lessonId: string,
  nextPosition: number,
  data: QuestionInput
) {
  await supabase!.from('quizzes').insert({
    lesson_id: lessonId,
    position: nextPosition,
    question: data.question,
    options: data.options,
    correct_index: data.correctIndex,
    explanation: data.explanation,
  })
}

export async function updateLessonQuizQuestion(quizId: string, data: QuestionInput) {
  await supabase!
    .from('quizzes')
    .update({
      question: data.question,
      options: data.options,
      correct_index: data.correctIndex,
      explanation: data.explanation,
    })
    .eq('id', quizId)
}

export async function deleteLessonQuizQuestion(quizId: string) {
  await supabase!.from('quizzes').delete().eq('id', quizId)
}

// Final assessment questions (many per course, up to ~20)
export async function createFinalQuestion(courseId: string, nextPosition: number, data: QuestionInput) {
  await supabase!.from('final_assessment_questions').insert({
    course_id: courseId,
    position: nextPosition,
    question: data.question,
    options: data.options,
    correct_index: data.correctIndex,
    explanation: data.explanation,
  })
}

export async function updateFinalQuestion(questionId: string, data: QuestionInput) {
  await supabase!
    .from('final_assessment_questions')
    .update({
      question: data.question,
      options: data.options,
      correct_index: data.correctIndex,
      explanation: data.explanation,
    })
    .eq('id', questionId)
}

export async function deleteFinalQuestion(questionId: string) {
  await supabase!.from('final_assessment_questions').delete().eq('id', questionId)
}

// ---------- Learner account control (super admin only, enforced by RLS) ----------

export async function setLearnerDisabled(learnerId: string, disabled: boolean) {
  await supabase!.from('learners').update({ is_disabled: disabled }).eq('id', learnerId)
}

// ---------- Admin dashboard: certificates / users / analytics ----------

export interface AdminCertRequest {
  id: string
  courseId: string
  learnerId: string
  learnerName: string
  learnerPhone: string
  requestedAt: string
  status: 'pending' | 'issued'
  transactionRef?: string
  issuedAt?: string
  certificateUrl?: string
}

export async function fetchAllCertRequestsAdmin(): Promise<AdminCertRequest[]> {
  const { data, error } = await supabase!
    .from('certificate_requests')
    .select('*, learners(full_name, phone)')
    .order('requested_at', { ascending: false })
  if (error || !data) return []
  return data.map((row: any) => ({
    id: row.id,
    courseId: row.course_id,
    learnerId: row.learner_id,
    learnerName: row.learners?.full_name ?? 'Unknown',
    learnerPhone: row.learners?.phone ?? '',
    requestedAt: row.requested_at,
    status: row.status,
    transactionRef: row.transaction_ref ?? undefined,
    issuedAt: row.issued_at ?? undefined,
    certificateUrl: row.certificate_url ?? undefined,
  }))
}

export async function markCertificateIssuedRemote(
  requestId: string,
  adminId: string,
  certificateUrl: string
) {
  await supabase!
    .from('certificate_requests')
    .update({
      status: 'issued',
      issued_at: new Date().toISOString(),
      issued_by: adminId,
      certificate_url: certificateUrl,
    })
    .eq('id', requestId)
}

export interface AdminLearnerRow {
  id: string
  fullName: string
  email: string
  phone?: string
  school: string
  country: string
  createdAt: string
  isDisabled: boolean
}

export async function fetchAllLearnersAdmin(): Promise<AdminLearnerRow[]> {
  const { data, error } = await supabase!
    .from('learners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((row: any) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? undefined,
    school: row.school,
    country: row.country,
    createdAt: row.created_at,
    isDisabled: row.is_disabled ?? false,
  }))
}

export interface AdminEnrollmentRow {
  learnerId: string
  courseId: string
  completed: boolean
  enrolledAt: string
}

export async function fetchAllEnrollmentsAdmin(): Promise<AdminEnrollmentRow[]> {
  const { data, error } = await supabase!
    .from('enrollments')
    .select('learner_id, course_id, completed, enrolled_at')
  if (error || !data) return []
  return data.map((row: any) => ({
    learnerId: row.learner_id,
    courseId: row.course_id,
    completed: row.completed,
    enrolledAt: row.enrolled_at,
  }))
}

// ---------- Admin account management (super_admin only) ----------
// Admins are created directly (name/email/password/role) via a database
// function, since the browser's public API key can never create auth
// accounts on its own -- see create_admin_account in supabase_schema.sql.

export interface AdminRow {
  id: string
  fullName: string
  email: string
  role: 'super_admin' | 'admin'
  permissions: string[]
  createdAt: string
}

export async function fetchAllAdmins(): Promise<AdminRow[]> {
  const { data, error } = await supabase!.from('admins').select('*').order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map((row: any) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    permissions: row.permissions || [],
    createdAt: row.created_at,
  }))
}

export async function createAdminAccount(
  fullName: string,
  email: string,
  password: string,
  role: 'admin' | 'super_admin',
  permissions: string[]
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase!.rpc('create_admin_account', {
    p_full_name: fullName,
    p_email: email,
    p_password: password,
    p_role: role,
    p_permissions: permissions,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function updateAdminRole(
  adminId: string,
  role: 'admin' | 'super_admin',
  permissions: string[]
) {
  await supabase!.from('admins').update({ role, permissions }).eq('id', adminId)
}

export async function removeAdmin(adminId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase!.rpc('remove_admin_account', { p_admin_id: adminId })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
