import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useApp } from '../context/AppContext'

export default function MyLearning() {
  const { enrollments, courses } = useApp()
  const inProgress = enrollments.filter((e) => !e.completed)
  const completed = enrollments.filter((e) => e.completed)

  return (
    <div className="pb-24">
      <TopBar title="My Learning" />
      <div className="px-4 py-4">
        <Section title="In Progress" empty="No courses in progress.">
          {inProgress.map((e) => {
            const c = courses.find((c) => c.id === e.courseId)
            if (!c) return null
            const pct = Math.round((e.completedLessonIds.length / c.lessons.length) * 100)
            return (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="block bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-2"
              >
                <p className="text-sm font-medium text-navy">{c.title}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-brand-green h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}% complete</p>
              </Link>
            )
          })}
        </Section>

        <Section title="Completed" empty="No completed courses yet.">
          {completed.map((e) => {
            const c = courses.find((c) => c.id === e.courseId)
            if (!c) return null
            return (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-2"
              >
                <p className="text-sm font-medium text-navy">{c.title}</p>
                <span className="text-xs text-brand-green font-semibold">{e.finalScore}%</span>
              </Link>
            )
          })}
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode
}) {
  const hasChildren = Array.isArray(children) ? children.some(Boolean) : !!children
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-navy mb-2">{title}</h2>
      {hasChildren ? children : <p className="text-sm text-gray-400">{empty}</p>}
    </div>
  )
}
