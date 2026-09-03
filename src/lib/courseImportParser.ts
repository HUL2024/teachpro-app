// Lets an admin draft a whole course in a text editor (Word, Notepad,
// whatever) using simple ALL-CAPS markers, then paste it in one go instead
// of clicking "Add Lesson" / "Add Question" dozens of times. See
// COURSE_IMPORT_TEMPLATE below for the exact format, shown to admins in
// the UI.

export interface ParsedQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ParsedLesson {
  title: string
  videoUrl?: string
  photos: string[]
  content: string
  practicalExample: string
  resources: { name: string; url: string }[]
  quizzes: ParsedQuestion[]
}

export interface ParseResult {
  lessons: ParsedLesson[]
  finalAssessment: ParsedQuestion[]
  errors: string[]
}

const LETTER_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 }

function isMarkerLine(line: string): boolean {
  return /^(LESSON|VIDEO|PHOTO|CONTENT|PRACTICAL|RESOURCES|QUIZ|FINAL ASSESSMENT|Q|CORRECT|EXPLAIN)\s*:/i.test(
    line.trim()
  ) || /^[A-F]\)/i.test(line.trim())
}

export function parseCourseImport(raw: string): ParseResult {
  const lines = raw.split('\n')
  const errors: string[] = []
  const lessons: ParsedLesson[] = []
  const finalAssessment: ParsedQuestion[] = []

  let lesson: ParsedLesson | null = null
  let inFinal = false
  let pendingQuestion: ParsedQuestion | null = null
  let accumulator: string[] | null = null // for CONTENT:/PRACTICAL: multi-line capture
  let accumulatorTarget: 'content' | 'practical' | null = null

  function flushAccumulator() {
    if (lesson && accumulator && accumulatorTarget) {
      const text = accumulator.join('\n').trim()
      if (accumulatorTarget === 'content') lesson.content = text
      if (accumulatorTarget === 'practical') lesson.practicalExample = text
    }
    accumulator = null
    accumulatorTarget = null
  }

  function flushQuestion() {
    if (!pendingQuestion) return
    if (!pendingQuestion.question.trim()) {
      pendingQuestion = null
      return
    }
    if (pendingQuestion.options.length < 2) {
      errors.push(`Question "${pendingQuestion.question.slice(0, 40)}..." needs at least 2 options.`)
    } else if (pendingQuestion.correctIndex < 0 || pendingQuestion.correctIndex >= pendingQuestion.options.length) {
      errors.push(`Question "${pendingQuestion.question.slice(0, 40)}..." has a missing or invalid CORRECT answer.`)
    } else {
      if (inFinal) finalAssessment.push(pendingQuestion)
      else if (lesson) lesson.quizzes.push(pendingQuestion)
    }
    pendingQuestion = null
  }

  function flushLesson() {
    flushAccumulator()
    flushQuestion()
    if (lesson) {
      if (!lesson.title.trim()) {
        errors.push('A lesson is missing a title (LESSON: line).')
      } else if (!lesson.content.trim()) {
        errors.push(`Lesson "${lesson.title}" has no CONTENT.`)
      } else {
        lessons.push(lesson)
      }
    }
    lesson = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const lessonMatch = line.match(/^LESSON:\s*(.*)$/i)
    if (lessonMatch) {
      flushLesson()
      lesson = {
        title: lessonMatch[1].trim(),
        photos: [],
        content: '',
        practicalExample: '',
        resources: [],
        quizzes: [],
      }
      inFinal = false
      continue
    }

    const finalMatch = line.match(/^FINAL ASSESSMENT:\s*$/i)
    if (finalMatch) {
      flushLesson()
      inFinal = true
      continue
    }

    if (!lesson && !inFinal) continue // ignore anything before the first LESSON:/FINAL ASSESSMENT:

    const videoMatch = line.match(/^VIDEO:\s*(.*)$/i)
    if (videoMatch && lesson) {
      flushAccumulator()
      lesson.videoUrl = videoMatch[1].trim() || undefined
      continue
    }

    const photoMatch = line.match(/^PHOTO:\s*(.*)$/i)
    if (photoMatch && lesson) {
      flushAccumulator()
      const url = photoMatch[1].trim()
      lesson.photos = url ? [url] : []
      continue
    }

    if (/^CONTENT:\s*$/i.test(line) && lesson) {
      flushAccumulator()
      accumulator = []
      accumulatorTarget = 'content'
      continue
    }

    if (/^PRACTICAL:\s*$/i.test(line) && lesson) {
      flushAccumulator()
      accumulator = []
      accumulatorTarget = 'practical'
      continue
    }

    if (/^RESOURCES:\s*$/i.test(line) && lesson) {
      flushAccumulator()
      continue
    }

    if (/^QUIZ:\s*$/i.test(line) && lesson) {
      flushAccumulator()
      flushQuestion()
      continue
    }

    const qMatch = line.match(/^Q:\s*(.*)$/i)
    if (qMatch) {
      flushAccumulator()
      flushQuestion()
      pendingQuestion = { question: qMatch[1].trim(), options: [], correctIndex: -1, explanation: '' }
      continue
    }

    const optMatch = line.match(/^([A-F])\)\s*(.*)$/i)
    if (optMatch && pendingQuestion) {
      pendingQuestion.options.push(optMatch[2].trim())
      continue
    }

    const correctMatch = line.match(/^CORRECT:\s*([A-F])/i)
    if (correctMatch && pendingQuestion) {
      pendingQuestion.correctIndex = LETTER_TO_INDEX[correctMatch[1].toUpperCase()] ?? -1
      continue
    }

    const explainMatch = line.match(/^EXPLAIN:\s*(.*)$/i)
    if (explainMatch && pendingQuestion) {
      pendingQuestion.explanation = explainMatch[1].trim()
      continue
    }

    // A resource line ("Name | URL") only makes sense right after
    // RESOURCES: and before the next marker -- since we don't hold a
    // dedicated "in resources" flag, just try to parse any non-marker line
    // with a pipe as a resource while we have a lesson and aren't mid
    // CONTENT/PRACTICAL/quiz capture.
    if (lesson && !accumulator && !pendingQuestion && line.includes('|') && !isMarkerLine(line)) {
      const [name, url] = line.split('|').map((s) => s.trim())
      if (name && url) {
        lesson.resources.push({ name, url })
        continue
      }
    }

    // Otherwise, if we're mid-CONTENT/PRACTICAL capture, this line is body
    // text -- keep it, even if it happens to look marker-ish.
    if (accumulator) {
      accumulator.push(rawLine)
      continue
    }
  }

  flushLesson()
  flushQuestion()

  if (lessons.length === 0 && finalAssessment.length === 0) {
    errors.unshift('Nothing recognized. Make sure your text starts with a "LESSON:" or "FINAL ASSESSMENT:" line.')
  }

  return { lessons, finalAssessment, errors }
}

export const COURSE_IMPORT_TEMPLATE = `LESSON: Why Lesson Planning Matters
VIDEO: https://www.youtube.com/watch?v=example
PHOTO: https://example.com/cover-photo.jpg
CONTENT:
Every effective lesson starts with a clear plan. A **lesson plan** keeps
you organized and makes sure every minute of class time is used well.

## Why it matters
Without a plan, lessons can drift off track and students lose focus.

PRACTICAL:
Before your next class, write down your top 3 learning objectives before
you plan any activities.

RESOURCES:
Lesson Plan Template | https://drive.google.com/your-link-here

QUIZ:
Q: What should you write down before planning activities?
A) Your learning objectives
B) The classroom seating chart
C) The school's phone number
D) Nothing, just start teaching
CORRECT: A
EXPLAIN: Objectives guide every other part of the lesson.

LESSON: Setting Learning Objectives
CONTENT:
Learning objectives describe what students should know or be able to do
by the end of the lesson.

QUIZ:
Q: A good learning objective should be...
A) Vague and general
B) Specific and measurable
C) A secret only the teacher knows
D) The same every single lesson
CORRECT: B
EXPLAIN: Specific, measurable objectives are easier to teach toward and assess.

FINAL ASSESSMENT:
Q: What is the first step in effective lesson planning?
A) Setting clear learning objectives
B) Buying new textbooks
C) Rearranging the classroom
D) Skipping straight to the quiz
CORRECT: A
EXPLAIN: Objectives guide every other part of the lesson.
`
