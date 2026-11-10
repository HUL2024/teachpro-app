import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import LessonContent from '../components/LessonContent'
import { useApp } from '../context/AppContext'
import { quizUnlockInfo, formatTimeRemaining } from '../lib/lessonLock'
import {
  CheckCircle2,
  Circle,
  PartyPopper,
  ClipboardCheck,
  Lock,
  Clock,
  ChevronDown,
  XCircle,
} from 'lucide-react'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { enrollments, enroll, courses } = useApp()
  const course = courses.find((c) => c.id === courseId)

  // Which lesson's quiz review is expanded under "Your Scores".
  const [reviewLessonId, setReviewLessonId] = useState<string | null>(null)

  // Re-render every minute so a "Unlocks in 3h 59m" countdown stays fresh
  // without needing a full page reload.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  if (!course) return <p className="p-4">Course not found.</p>

  const enrollment = enrollments.find((e) => e.courseId === course.id)
  const enrolled = !!enrollment
  const completedCount = enrollment?.completedLessonIds.length || 0
  const pct = Math.round((completedCount / course.lessons.length) * 100)
  const allLessonsDone = enrolled && completedCount >= course.lessons.length
  const readyForAssessment = allLessonsDone && !enrollment?.completed

  function handleEnroll() {
    if (course) enroll(course.id)
  }

  return (
    <div className="pb-24">
      <TopBar title={course.title} back />

      <div className="px-4 py-4">
        <span className="text-[10px] uppercase tracking-wide text-brand-green font-semibold">
          {course.category}
        </span>
        <LessonContent text={course.description} className="mt-1" />

        {enrolled ? (
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-brand-green h-2 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{pct}% Complete</p>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            className="mt-4 bg-brand-green text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
          >
            Enroll FREE
          </button>
        )}

        {readyForAssessment && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <ClipboardCheck className="mx-auto text-navy mb-1" size={22} />
            <p className="font-semibold text-navy text-sm">All lessons complete!</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Take the final assessment (70% to pass) to finish this course and unlock your
              certificate.
            </p>
            <button
              onClick={() => navigate(`/courses/${course.id}/final-assessment`)}
              className="inline-block mt-3 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Take Final Assessment
            </button>
          </div>
        )}

        {enrollment?.completed && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <PartyPopper className="mx-auto text-brand-green mb-1" size={22} />
            <p className="font-semibold text-navy text-sm">Congratulations!</p>
            <p className="text-xs text-gray-500 mt-0.5">
              You've completed this course. Final Score: {enrollment.finalScore}%
            </p>
            <Link
              to={`/certificates`}
              state={{ courseId: course.id }}
              className="inline-block mt-3 bg-gold text-navy text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Get Certificate
            </Link>
          </div>
        )}

        <h2 className="font-semibold text-navy mt-6 mb-2">Lessons</h2>
        <div className="space-y-2">
          {course.lessons.map((l, i) => {
            const done = enrollment?.completedLessonIds.includes(l.id)
            // A lesson's content unlocks as soon as every lesson before it
            // is complete -- this stops jumping ahead (e.g. straight to
            // Lesson 5), but reading the content itself is never
            // time-delayed. Only that lesson's quiz is (see below).
            const priorLessonsDone = course.lessons
              .slice(0, i)
              .every((prev) => enrollment?.completedLessonIds.includes(prev.id))
            const locked = !enrolled || !priorLessonsDone
            const quizLock = enrolled && !locked && l.quizzes.length > 0 ? quizUnlockInfo(enrollment, course, i) : null

            return (
              <button
                key={l.id}
                disabled={locked}
                onClick={() => navigate(`/courses/${course.id}/lessons/${l.id}`)}
                className="w-full flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-left disabled:opacity-50"
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                ) : locked ? (
                  <Lock size={16} className="text-gray-300 shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-300 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">Lesson {i + 1} of {course.lessons.length}</p>
                  <p className="text-sm font-medium text-navy truncate">{l.title}</p>
                  {quizLock?.locked && quizLock.unlockAt && (
                    <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      Quiz unlocks in {formatTimeRemaining(quizLock.unlockAt)}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {enrolled && (
          <>
            <h2 className="font-semibold text-navy mt-6 mb-2">Your Scores</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {course.lessons
                .filter((l) => l.quizzes.length > 0)
                .map((l) => {
                  const s = enrollment?.quizScores[l.id]
                  // A passed quiz can't be retaken, so it's safe to open a
                  // review of it. A failed one can still be retaken, so its
                  // answers stay hidden.
                  const canReview = s !== undefined && s >= 70
                  const open = reviewLessonId === l.id
                  const answers = enrollment?.quizAnswers?.[l.id]
                  const correctCount = answers
                    ? l.quizzes.filter((q) => answers[q.id] === q.correctIndex).length
                    : 0
                  return (
                    <div key={l.id}>
                      <button
                        type="button"
                        disabled={!canReview}
                        onClick={() => setReviewLessonId(open ? null : l.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left"
                      >
                        <span className="text-gray-600 truncate pr-2">{l.title}</span>
                        {s === undefined ? (
                          <span className="text-xs text-gray-300 shrink-0">Not attempted</span>
                        ) : (
                          <span className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-xs font-semibold ${
                                s >= 70 ? 'text-brand-green' : 'text-red-500'
                              }`}
                            >
                              {s}%
                            </span>
                            {canReview && (
                              <ChevronDown
                                size={14}
                                className={`text-gray-400 transition-transform ${
                                  open ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </span>
                        )}
                      </button>

                      {canReview && open && (
                        <div className="px-4 pb-4 space-y-3 bg-gray-50/60">
                          {!answers ? (
                            <p className="text-xs text-gray-500 pt-3">
                              Question-by-question details are only saved for quizzes taken
                              after this feature was added.
                            </p>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500 pt-3">
                                You got {correctCount} of {l.quizzes.length} correct.
                              </p>
                              {l.quizzes.map((q, qi) => {
                                const chosen = answers[q.id]
                                if (chosen === undefined) return null
                                const right = chosen === q.correctIndex
                                return (
                                  <div
                                    key={q.id}
                                    className="bg-white rounded-xl border border-gray-100 p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      {right ? (
                                        <CheckCircle2
                                          size={16}
                                          className="text-brand-green shrink-0 mt-0.5"
                                        />
                                      ) : (
                                        <XCircle
                                          size={16}
                                          className="text-red-500 shrink-0 mt-0.5"
                                        />
                                      )}
                                      <p className="text-sm text-navy">
                                        {qi + 1}. {q.question}
                                      </p>
                                    </div>
                                    {right ? (
                                      <p className="text-xs text-brand-green font-semibold mt-1.5 ml-6">
                                        Correct
                                      </p>
                                    ) : (
                                      <div className="mt-2 ml-6 space-y-1.5 text-xs">
                                        <p className="text-red-500">
                                          <span className="font-semibold">Your answer: </span>
                                          {q.options[chosen]}
                                        </p>
                                        <p className="text-brand-green">
                                          <span className="font-semibold">Correct answer: </span>
                                          {q.options[q.correctIndex]}
                                        </p>
                                        {q.explanation?.trim() && (
                                          <p className="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">
                                            <span className="font-semibold">Tip: </span>
                                            {q.explanation}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              <div className="flex items-center justify-between px-4 py-2.5 text-sm bg-gray-50/50">
                <span className="font-medium text-navy">Final Assessment</span>
                {enrollment?.finalScore == null ? (
                  <span className="text-xs text-gray-300">Not attempted</span>
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      enrollment.finalScore >= 70 ? 'text-brand-green' : 'text-red-500'
                    }`}
                  >
                    {enrollment.finalScore}%
                    {!enrollment.completed && ' (failed attempt)'}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
