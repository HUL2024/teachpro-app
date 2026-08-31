import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { stripLessonMarkup } from '../components/LessonContent'
import { useApp } from '../context/AppContext'

export default function Courses() {
  const { enrollments, courses } = useApp()

  return (
    <div className="pb-24">
      <TopBar title="Courses" />
      <div className="px-4 py-4 space-y-3">
        {courses.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">No courses available yet.</p>
        )}
        {courses.map((c) => {
          const enrolled = enrollments.some((e) => e.courseId === c.id)
          return (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-brand-green font-semibold">
                    {c.category}
                  </span>
                  <p className="font-semibold text-navy mt-0.5">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{stripLessonMarkup(c.description)}</p>
                </div>
                {c.isDemo && (
                  <span className="text-[9px] bg-gold/20 text-gold border border-gold/40 rounded-full px-2 py-0.5 whitespace-nowrap">
                    Demo
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{c.lessons.length} lessons · Free</span>
                {enrolled && (
                  <span className="text-xs text-brand-green font-medium">Enrolled</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
