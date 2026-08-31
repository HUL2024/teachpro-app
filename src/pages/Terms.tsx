import TopBar from '../components/TopBar'

export default function Terms() {
  return (
    <div className="pb-24">
      <TopBar title="Terms & Conditions" back />
      <div className="px-4 py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: 2026</p>

        <p>
          These Terms govern your use of the TeachPro app. By creating an account, you agree to
          them. If you don't agree, please don't use the app.
        </p>

        <div>
          <h3 className="font-semibold text-navy mb-1">1. Your account</h3>
          <p>
            You register using your phone number, which is your main login identifier, along with
            a password and your date of birth. You're responsible for keeping your password
            private and for all activity that happens under your account. Do not share your login
            with anyone else.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">2. Course access</h3>
          <p>
            All courses on TeachPro are provided free of charge. Lessons and their quizzes unlock
            in order, and a lesson's quiz becomes available 24 hours after finishing the previous
            lesson — this pacing is intentional and applies to every learner equally.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">3. Certificates and payment</h3>
          <p>
            Certificates are optional and require a separate administration fee, paid manually via
            Mobile Money and confirmed by an administrator — TeachPro does not process payments
            automatically through the app. Each payment transaction reference may only be used for
            one certificate request; submitting a reference that has already been used elsewhere
            will be rejected. Certificate fees are non-refundable once a certificate has been
            issued.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">4. Acceptable use</h3>
          <p>
            You agree not to misrepresent your identity, attempt to bypass course pacing or quiz
            requirements, share or resell certificates issued to someone else, or use the app in
            any way that disrupts other learners or the platform itself.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">5. Account suspension</h3>
          <p>
            An administrator may disable an account that violates these Terms, submits fraudulent
            payment information, or otherwise misuses the platform. Disabling an account
            immediately ends that session and blocks future logins until the account is
            re-enabled.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">6. No warranty</h3>
          <p>
            TeachPro is provided "as is." While we work to keep course content accurate and the
            app running reliably, we don't guarantee uninterrupted access, and course content may
            be added, edited, or removed over time as the platform improves.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">7. Changes to these Terms</h3>
          <p>
            These Terms may be updated as the platform evolves. Continuing to use TeachPro after a
            change means you accept the updated Terms.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-navy mb-1">8. Contact</h3>
          <p>Questions about these Terms can be directed to +231 88 852 4563.</p>
        </div>
      </div>
    </div>
  )
}
