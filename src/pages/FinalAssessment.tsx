import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import TopBar from '../components/TopBar'
import { useApp } from '../context/AppContext'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

export default function FinalAssessment() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { submitFinalAssessment, enrollments, courses } = useApp()
  const course = courses.find((c) => c.id === courseId)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    reset: boolean
    attemptsLeft: number
  } | null>(null)

  if (!course) return <p className="p-4">Course not found.</p>

  const enrollment = enrollments.find((e) => e.courseId === course.id)
  const allLessonsDone =
    !!enrollment && enrollment.completedLessonIds.length >= course.lessons.length

  // Guard the route directly -- not just the button that links here -- so
  // typing/bookmarking the URL can't skip ahead of the lessons.
  if (!allLessonsDone && !result) {
    return <Navigate to={`/courses/${course.id}`} replace />
  }

  const questions = course.finalAssessment
  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  async function handleSubmit() {
    // Compute the score directly here rather than from a stale render variable,
    // since state updates aren't visible until the next render.
    const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length
    const score = Math.round((correctCount / questions.length) * 100)
    setSubmitting(true)
    const outcome = await submitFinalAssessment(course!.id, score)
    setSubmitting(false)
    setResult({ score, ...outcome })
  }

  function handleRetry() {
    setAnswers({})
    setResult(null)
  }

  return (
    <div className="pb-28">
      <TopBar title="Final Assessment" back />
      <div className="px-4 py-4">
        {!result ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Answer all questions below. You need 70% or higher to pass and unlock your
              certificate eligibility. You have up to 2 attempts — failing twice resets this
              course's progress and you'll need to redo the lessons.
            </p>
            <div className="space-y-4">
              {questions.map((q, qi) => (
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
                          answers[q.id] === oi
                            ? 'border-brand-green bg-green-50/50'
                            : 'border-gray-200'
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
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="mt-6 w-full bg-brand-green text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-40"
            >
              {submitting ? 'Submitting…' : 'Submit Assessment'}
            </button>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm mt-4">
            {result.passed ? (
              <CheckCircle2 size={40} className="mx-auto text-brand-green mb-2" />
            ) : result.reset ? (
              <RotateCcw size={40} className="mx-auto text-red-500 mb-2" />
            ) : (
              <XCircle size={40} className="mx-auto text-red-500 mb-2" />
            )}
            <p className="text-xl font-bold text-navy">{result.score}%</p>

            {result.passed && (
              <p className="text-sm text-gray-500 mt-1">
                You passed! You've completed this course.
              </p>
            )}

            {!result.passed && !result.reset && (
              <p className="text-sm text-gray-500 mt-1">
                You need 70% to pass. You have {result.attemptsLeft} attempt
                {result.attemptsLeft === 1 ? '' : 's'} left before the course resets.
              </p>
            )}

            {result.reset && (
              <p className="text-sm text-gray-500 mt-1">
                You've now failed twice. This course's progress has been reset — all lessons
                are marked incomplete and you'll need to go through them again before retaking
                the final assessment.
              </p>
            )}

            {result.passed ? (
              <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="mt-4 w-full bg-brand-green text-white font-semibold py-3 rounded-lg text-sm"
              >
                View Certificate Options
              </button>
            ) : result.reset ? (
              <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="mt-4 w-full bg-navy text-white font-semibold py-3 rounded-lg text-sm"
              >
                Start Course Over
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="mt-4 w-full bg-brand-green text-white font-semibold py-3 rounded-lg text-sm"
              >
                Retry Assessment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
