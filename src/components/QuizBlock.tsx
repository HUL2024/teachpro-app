import { useState } from 'react'
import type { Quiz } from '../lib/types'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function QuizBlock({
  quiz,
  passed,
  onSubmit,
}: {
  quiz: Quiz
  passed: boolean
  onSubmit: (correct: boolean) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = selected === quiz.correctIndex

  function handleSubmit() {
    if (selected === null) return
    setSubmitted(true)
    onSubmit(isCorrect)
  }

  function handleTryAgain() {
    setSelected(null)
    setSubmitted(false)
  }

  // Already passed in a previous visit to this lesson -- show a settled state
  // instead of forcing them to redo it every time they revisit.
  if (passed && !submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2">
        <CheckCircle2 size={18} className="text-brand-green shrink-0" />
        <p className="text-sm text-green-800">You've already passed this quiz.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="font-medium text-navy text-sm mb-3">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          const isSelected = selected === i
          // Only reveal the correct option once they've actually gotten it
          // right -- revealing it on a wrong attempt would let "Try Again"
          // just mean "click the highlighted one" instead of testing anything.
          const showCorrect = submitted && isCorrect && i === quiz.correctIndex
          const showWrong = submitted && isSelected && i !== quiz.correctIndex
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => setSelected(i)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border flex items-center gap-2 ${
                showCorrect
                  ? 'bg-green-50 border-green-300'
                  : showWrong
                    ? 'bg-red-50 border-red-300'
                    : isSelected
                      ? 'border-brand-green bg-green-50/50'
                      : 'border-gray-200'
              }`}
            >
              <span className="font-semibold text-gray-400">{letter}.</span>
              <span className="flex-1">{opt}</span>
              {showCorrect && <CheckCircle2 size={16} className="text-brand-green" />}
              {showWrong && <XCircle size={16} className="text-red-500" />}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-3 w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-40"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className={`font-semibold ${isCorrect ? 'text-brand-green' : 'text-red-500'}`}>
            {isCorrect
              ? 'Correct! You can move on to the next lesson.'
              : 'Not quite — review the lesson above, then try again.'}
          </p>
          {isCorrect && <p className="text-gray-500 mt-1">{quiz.explanation}</p>}
          {!isCorrect && (
            <button
              onClick={handleTryAgain}
              className="mt-2 w-full bg-navy text-white font-semibold py-2 rounded-lg text-xs"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  )
}
