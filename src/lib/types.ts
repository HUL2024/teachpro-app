export type CertificateStatus = 'not_requested' | 'pending' | 'issued'

export type AdminRole = 'super_admin' | 'admin'

// A Learner is someone who logs in to take courses. Admins are a completely
// separate concept (see AdminAccount below) with their own table -- an
// admin never has a Learner profile and never appears in learner counts.
export interface Learner {
  id: string
  fullName: string
  email: string
  phone: string
  password?: string
  dateOfBirth?: string // ISO date string, e.g. '1990-05-14'
  country: string
  school: string
  subject?: string
  level?: string
  yearsExperience?: number
  bio?: string
  photoUrl?: string
  isDisabled?: boolean
}

// The signed-in identity in the app is either a Learner or an AdminAccount,
// never both -- keeping these separate is what guarantees admins can't
// accidentally get counted as learners in analytics.
export interface AdminAccount {
  id: string
  fullName: string
  email: string
  role: AdminRole
  permissions: string[]
}

export interface Quiz {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  videoUrl?: string
  content: string
  practicalExample: string
  photos: string[]
  resources: { name: string; url: string }[]
  // Up to ~10 quiz questions per lesson (not just one) -- a learner must
  // score 70%+ across all of them to unlock the next lesson.
  quizzes: Quiz[]
}

export interface Course {
  id: string
  title: string
  category: string
  description: string
  isDemo: boolean
  lessons: Lesson[]
  // Up to ~20 questions for the course's final assessment.
  finalAssessment: Quiz[]
}

export interface Enrollment {
  courseId: string
  enrolledAt: string
  completedLessonIds: string[]
  // ISO timestamp of when each lesson was completed -- used to enforce the
  // 24-hour pacing lock before the next lesson becomes available.
  lessonCompletedAt: Record<string, string>
  quizScores: Record<string, number>
  finalScore: number | null
  completed: boolean
  completedAt: string | null
  failedAttempts: number
}

export interface CertificateRequest {
  id: string
  courseId: string
  learnerId: string
  requestedAt: string
  status: CertificateStatus
  transactionRef?: string
  issuedAt?: string
  certificateUrl?: string
}
