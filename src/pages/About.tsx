import TopBar from '../components/TopBar'

export default function About() {
  return (
    <div className="pb-24">
      <TopBar title="About TeachPro" back />
      <div className="px-4 py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
        <p>
          TeachPro is a mobile learning platform built for teachers, principals, and school
          administrators in Liberia. It exists to make professional development genuinely
          accessible — free courses that work on an ordinary smartphone, without needing a
          reliable internet connection at every moment or a large data budget to keep up.
        </p>

        <div>
          <h3 className="font-semibold text-navy mb-1">What you can do here</h3>
          <p>
            Browse and enroll in courses covering lesson planning, classroom management, school
            administration, financial management, and more. Each course is broken into short
            lessons with a video, written content, practical examples, and a quiz. Finishing every
            lesson unlocks a final assessment, and passing it makes you eligible for a certificate.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">How certificates work</h3>
          <p>
            Certificates are not automated. After you pass a course's final assessment, you submit
            a small administration fee by Mobile Money and enter your transaction reference in the
            app. A real person on the TeachPro team confirms the payment and issues your
            certificate, which then appears in the app for you to view or download.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Who runs it</h3>
          <p>
            TeachPro is maintained by a small administrative team responsible for course content,
            certificate confirmation, and keeping the platform running smoothly for every teacher
            who uses it.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Questions or feedback</h3>
          <p>
            If something isn't working, or you have a suggestion for a course you'd like to see,
            reach out through your school administrator or the TeachPro contact number provided
            during certificate requests: +231 88 852 4563.
          </p>
        </div>
      </div>
    </div>
  )
}
