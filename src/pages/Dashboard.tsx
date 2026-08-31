import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BookOpen, CheckCircle2, ListChecks, Award } from 'lucide-react'

export default function Dashboard() {
  const { currentUser, enrollments, courses } = useApp()

  const coursesEnrolled = enrollments.length
  const coursesCompleted = enrollments.filter((e) => e.completed).length
  const lessonsCompleted = enrollments.reduce((sum, e) => sum + e.completedLessonIds.length, 0)
  const certificatesCount = enrollments.filter((e) => e.completed).length

  const inProgress = enrollments.filter((e) => !e.completed)
  const continueItem = inProgress[0]
  const continueCourse = continueItem ? courses.find((c) => c.id === continueItem.courseId) : null
  const continuePct = continueCourse
    ? Math.round(
        ((continueItem?.completedLessonIds.length || 0) / continueCourse.lessons.length) * 100
      )
    : 0

  return (
    <div className="pb-24">
      <div className="bg-navy text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <p className="text-gray-300 text-sm">Welcome back,</p>
        <h1 className="text-xl font-bold">{currentUser?.fullName || 'Teacher'}!</h1>
      </div>

      <div className="px-4 -mt-5 grid grid-cols-2 gap-3">
        <StatCard icon={BookOpen} label="Courses Enrolled" value={coursesEnrolled} color="text-brand-green" />
        <StatCard icon={CheckCircle2} label="Courses Completed" value={coursesCompleted} color="text-navy" />
        <StatCard icon={ListChecks} label="Lessons Completed" value={lessonsCompleted} color="text-brand-green" />
        <StatCard icon={Award} label="Certificates" value={certificatesCount} color="text-gold" />
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-semibold text-navy mb-2">Continue Learning</h2>
        {continueCourse ? (
          <Link
            to={`/courses/${continueCourse.id}`}
            className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p className="font-semibold text-navy">{continueCourse.title}</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-brand-green h-2 rounded-full"
                style={{ width: `${continuePct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{continuePct}% Complete</p>
            <span className="inline-block mt-3 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg">
              {continuePct >= 100 ? 'Take Final Assessment' : 'Continue Lesson'}
            </span>
          </Link>
        ) : (
          <Link
            to="/courses"
            className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center text-gray-500 text-sm"
          >
            You haven't enrolled in a course yet. Tap to browse courses →
          </Link>
        )}
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-semibold text-navy mb-2">My Courses</h2>
        <div className="space-y-3">
          {enrollments.length === 0 && (
            <p className="text-sm text-gray-400">No enrolled courses yet.</p>
          )}
          {enrollments.map((e) => {
            const c = courses.find((c) => c.id === e.courseId)
            if (!c) return null
            const pct = Math.round((e.completedLessonIds.length / c.lessons.length) * 100)
            return (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="block bg-white rounded-xl p-3 shadow-sm border border-gray-100"
              >
                <p className="text-sm font-medium text-navy">{c.title}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-brand-green h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}% complete</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof BookOpen
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      <Icon size={18} className={color} />
      <p className="text-xl font-bold text-navy mt-1">{value}</p>
      <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
    </div>
  )
}
