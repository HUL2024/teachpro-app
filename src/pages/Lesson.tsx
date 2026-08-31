import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import LessonContent from '../components/LessonContent'
import { useApp } from '../context/AppContext'
import { quizUnlockInfo, formatTimeRemaining } from '../lib/lessonLock'
import { FileText, Lightbulb, ArrowRight, Lock, CheckCircle2, XCircle, ClipboardList, Clock } from 'lucide-react'

export default function Lesson() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { enrollments, markLessonComplete, recordQuizScore, courses } = useApp()

  const course = courses.find((c) => c.id === courseId)
  const lessonIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1
  const lesson = course?.lessons[lessonIndex]

  // 'lesson' shows the content; 'quiz' replaces it entirely with the quiz
  // (only reachable by tapping "Take Quiz", and cancelable back to 'lesson').
  const [mode, setMode] = useState<'lesson' | 'quiz'>('lesson')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [sessionScore, setSessionScore] = useState<number | null>(null)

  useEffect(() => {
    setMode('lesson')
    setAnswers({})
    setSubmitted(false)
    setSessionScore(null)
  }, [lessonId])

  // Re-render every minute so the "Quiz unlocks in Xh Ym" countdown stays
  // fresh without needing a full page reload.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  if (!course || !lesson) return <p className="p-4">Lesson not found.</p>

  const enrollment = enrollments.find((e) => e.courseId === course.id)

  // Guard the route directly -- not just the lesson-list buttons -- so
  // bookmarking or typing a later lesson's URL can't skip ahead. Reading
  // the lesson itself is never time-locked -- only its quiz is (below).
  const priorLessonsDone = course.lessons
    .slice(0, lessonIndex)
    .every((prev) => enrollment?.completedLessonIds.includes(prev.id))
  if (!priorLessonsDone) {
    return <Navigate to={`/courses/${course.id}`} replace />
  }

  const alreadyDone = enrollment?.completedLessonIds.includes(lesson.id)
  const isLast = lessonIndex === course.lessons.length - 1
  const nextLesson = !isLast ? course.lessons[lessonIndex + 1] : null

  const storedScore = enrollment?.quizScores[lesson.id]
  const alreadyPassed = storedScore !== undefined && storedScore >= 70
  const hasQuiz = lesson.quizzes.length > 0
  const quizLock = quizUnlockInfo(enrollment, course, lessonIndex)
  const passedThisSession = submitted && sessionScore !== null && sessionScore >= 70
  const canContinue = !hasQuiz || alreadyPassed || passedThisSession || alreadyDone

  const allAnswered = lesson.quizzes.every((q) => answers[q.id] !== undefined)

  function handleSubmitQuiz() {
    const correctCount = lesson!.quizzes.filter((q) => answers[q.id] === q.correctIndex).length
    const score = Math.round((correctCount / lesson!.quizzes.length) * 100)
    recordQuizScore(course!.id, lesson!.id, score)
    setSessionScore(score)
    setSubmitted(true)
  }

  function handleRetryQuiz() {
    setAnswers({})
    setSubmitted(false)
    setSessionScore(null)
  }

  function handleCancelQuiz() {
    setMode('lesson')
    setAnswers({})
    setSubmitted(false)
    setSessionScore(null)
  }

  function completeAndAdvance() {
    if (!canContinue) return
    markLessonComplete(course!.id, lesson!.id)
    if (nextLesson) {
      navigate(`/courses/${course!.id}/lessons/${nextLesson.id}`)
    } else {
      navigate(`/courses/${course!.id}/final-assessment`)
    }
  }

  // ---------------- Quiz mode: lesson content is fully hidden ----------------
  if (mode === 'quiz' && !quizLock.locked) {
    return (
      <div className="pb-28">
        <TopBar title="Lesson Quiz" />
        <div className="px-4 py-4">
          <h1 className="text-base font-bold text-navy mb-1">{lesson.title}</h1>
          <p className="text-xs text-gray-500 mb-4">
            {lesson.quizzes.length} question{lesson.quizzes.length === 1 ? '' : 's'} — score 70% or
            higher to continue.
          </p>

          {!submitted ? (
            <>
              <div className="space-y-3">
                {lesson.quizzes.map((q, qi) => (
                  <div key={q.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-navy mb-3">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                          className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border ${
                            answers[q.id] === oi ? 'border-brand-green bg-green-50/50' : 'border-gray-200'
                          }`}
                        >
                          <span className="font-semibold text-gray-400 mr-2">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleCancelQuiz}
                  className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="flex-1 bg-brand-green text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-40"
                >
                  Submit Quiz
                </button>
              </div>
            </>
          ) : passedThisSession ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <CheckCircle2 size={32} className="mx-auto text-brand-green mb-2" />
              <p className="font-semibold text-navy">Passed! Score: {sessionScore}%</p>
              <button
                onClick={completeAndAdvance}
                className="mt-4 w-full bg-brand-green text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {alreadyDone ? 'Continue' : nextLesson ? 'Continue to Next Lesson' : 'Continue to Final Assessment'}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <XCircle size={32} className="mx-auto text-red-500 mb-2" />
              <p className="font-semibold text-navy">Score: {sessionScore}% — you need 70% to continue.</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCancelQuiz}
                  className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg text-sm"
                >
                  Back to Lesson
                </button>
                <button
                  onClick={handleRetryQuiz}
                  className="flex-1 bg-navy text-white font-semibold py-3 rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------------- Lesson mode ----------------
  return (
    <div className="pb-28">
      <TopBar title={`Lesson ${lessonIndex + 1} of ${course.lessons.length}`} back />

      <div className="px-4 py-4">
        <h1 className="text-lg font-bold text-navy">{lesson.title}</h1>

        {lesson.videoUrl ? (
          <div className="w-full rounded-xl overflow-hidden mt-3 aspect-video bg-black">
            <iframe
              src={lesson.videoUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        ) : (
          <div className="w-full bg-gray-800 rounded-xl aspect-video mt-3 flex items-center justify-center text-gray-400 text-xs">
            No video for this lesson
          </div>
        )}

        {lesson.photos[0] && (
          <img src={lesson.photos[0]} alt="" className="w-full h-40 object-cover rounded-xl mt-3" />
        )}

        <LessonContent text={lesson.content} className="mt-4" />

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Lightbulb size={18} className="text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">{lesson.practicalExample}</p>
        </div>

        {lesson.resources.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">GOOGLE DRIVE FILES</h3>
            {lesson.resources.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm shadow-sm mb-2"
              >
                <FileText size={16} className="text-navy" />
                <span className="text-gray-700">{r.name}</span>
              </a>
            ))}
          </div>
        )}

        {hasQuiz && (alreadyPassed || passedThisSession) && (
          <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-brand-green shrink-0" />
            <p className="text-sm text-green-800">You've already passed this lesson's quiz.</p>
          </div>
        )}

        {hasQuiz && !alreadyPassed && !passedThisSession && quizLock.locked && quizLock.unlockAt && (
          <div className="mt-6 w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <Clock size={20} className="mx-auto text-amber-600 mb-1" />
            <p className="text-sm font-semibold text-navy">
              Quiz unlocks in {formatTimeRemaining(quizLock.unlockAt)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Take this time to read through the lesson above before the quiz opens.
            </p>
          </div>
        )}

        {hasQuiz && !alreadyPassed && !passedThisSession && !quizLock.locked && (
          <button
            onClick={() => setMode('quiz')}
            className="mt-6 w-full bg-navy text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <ClipboardList size={16} />
            Take Quiz ({lesson.quizzes.length} question{lesson.quizzes.length === 1 ? '' : 's'})
          </button>
        )}

        <button
          onClick={completeAndAdvance}
          disabled={!canContinue}
          className="mt-3 w-full bg-brand-green text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {!canContinue ? (
            <>
              <Lock size={16} />
              {quizLock.locked ? 'Wait for the Quiz to Unlock' : 'Take the Quiz to Continue'}
            </>
          ) : (
            <>
              {alreadyDone ? 'Continue' : 'Mark Complete & Continue'}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <Link to={`/courses/${course.id}`} className="block text-center text-xs text-gray-400 mt-3">
          Back to course overview
        </Link>
      </div>
    </div>
  )
}
