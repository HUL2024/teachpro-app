import TopBar from '../components/TopBar'

export default function Privacy() {
  return (
    <div className="pb-24">
      <TopBar title="Privacy Policy" back />
      <div className="px-4 py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: 2026</p>

        <p>
          This Privacy Policy explains what information TeachPro collects, why, and how it's
          protected.
        </p>

        <div>
          <h3 className="font-semibold text-navy mb-1">Information we collect</h3>
          <p>
            When you register, we collect your full name, phone number, date of birth, country,
            and school. As you use the app, we also store your course enrollments, completed
            lessons, quiz scores, final assessment results, and any certificate requests you
            submit. If you choose to add one, we store a profile photo.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Why we collect it</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your phone number is your login identifier and is also used, together with your date of birth, to verify your identity if you ever need to reset your password.</li>
            <li>Your date of birth is used only for that password-recovery check — it is not shared or displayed elsewhere in the app.</li>
            <li>Course and quiz data is used to track your progress, enforce lesson pacing, and determine certificate eligibility.</li>
            <li>Certificate requests, including payment transaction references, are used solely to let an administrator confirm your payment and issue your certificate.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Who can see your information</h3>
          <p>
            Administrators can see your profile details, course progress, and certificate requests
            in order to run the platform, confirm payments, and provide support. Your information
            is never sold, and it is not shared with outside advertisers or third parties for
            marketing purposes.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">How your information is stored</h3>
          <p>
            Your data is stored in a secured cloud database with access controls that restrict
            each learner to their own records, and restrict administrative access to authorized
            admin accounts only. Profile photos are compressed before upload and stored in secured
            cloud storage.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Password security</h3>
          <p>
            Your password is never stored in readable form — it's stored using industry-standard
            one-way encryption (hashing), so even TeachPro's own administrators cannot view it.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Your choices</h3>
          <p>
            You can update most of your profile details at any time from the Profile screen. To
            request a full copy of your data, or to permanently delete your account and all
            associated data, contact an administrator at +231 88 852 4563. Account deletion is
            permanent and removes your enrollments, progress, and certificate requests along with
            it.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">Changes to this policy</h3>
          <p>
            This policy may be updated as the platform evolves. Material changes will be reflected
            here with an updated date.
          </p>
        </div>
      </div>
    </div>
  )
}
