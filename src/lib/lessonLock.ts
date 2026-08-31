import type { Course, Enrollment } from './types'

export const QUIZ_LOCK_HOURS = 24

export interface QuizUnlockInfo {
  locked: boolean
  unlockAt?: number // epoch ms
}

// The QUIZ for a lesson unlocks QUIZ_LOCK_HOURS after the previous lesson
// was completed -- giving the learner time to actually read/watch the
// lesson before they're able to quiz on it, instead of letting someone
// blitz through every quiz without engaging with the content. The lesson
// content itself is never time-locked -- only the quiz is. The very first
// lesson has no wait, since there's no previous lesson to pace against.
export function quizUnlockInfo(
  enrollment: Enrollment | undefined,
  course: Course,
  lessonIndex: number
): QuizUnlockInfo {
  if (lessonIndex <= 0) return { locked: false }

  const prevLesson = course.lessons[lessonIndex - 1]
  const completedAt = enrollment?.lessonCompletedAt?.[prevLesson.id]
  // No timestamp on record (e.g. completed before this feature existed, or
  // prior lesson somehow not done yet -- that's guarded elsewhere) --
  // don't retroactively lock learners out.
  if (!completedAt) return { locked: false }

  const unlockAt = new Date(completedAt).getTime() + QUIZ_LOCK_HOURS * 60 * 60 * 1000
  if (Date.now() < unlockAt) return { locked: true, unlockAt }
  return { locked: false }
}

export function formatTimeRemaining(unlockAt: number): string {
  const ms = Math.max(0, unlockAt - Date.now())
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}
