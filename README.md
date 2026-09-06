# TeachPro

Teacher professional development app for Liberia — courses, lessons, quizzes,
final assessments, and manually-issued certificates. Built with React + Vite +
Capacitor so it runs as a real Android app.

Currently in **demo mode**: all data (accounts, progress, certificate
requests) is stored on-device only, so you can test the whole app end-to-end
right now with no backend setup. Connect Supabase later (see below) to make
it a real shared multi-user app.

---

## 1. Try it right now (no install needed)

Open the "TeachPro" artifact/preview shared alongside this project — it's the
same code, running in the browser.

## 2. Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL. Register an account, browse Courses, enroll,
complete lessons and quizzes, pass the final assessment, then check the
Certificates tab to see the manual-payment request flow.

## 3. Get a real, installable APK — for free, no Play Store account needed

This project can't be compiled into an APK on most local machines without
Android Studio installed, so instead we use **GitHub Actions** (GitHub's free
cloud build servers) to do the compiling for you.

**Steps:**

1. Create a free GitHub account if you don't have one: https://github.com/join
2. Create a new empty repository (e.g. `teachpro-app`), and don't initialize
   it with a README.
3. Push this project to it:
   ```bash
   cd teachpro
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/teachpro-app.git
   git push -u origin main
   ```
4. Go to your repository on GitHub → the **Actions** tab. A workflow called
   "Build Android APK" will run automatically (it also runs any time you
   push new changes). Wait a few minutes for it to finish (green check).
5. Click into the finished run → scroll to **Artifacts** → download
   `TeachPro-debug-apk`. Unzip it — inside is `app-debug.apk`.
6. Transfer that `.apk` file to your Android phone (email it to yourself,
   use a USB cable, or upload to Google Drive/WhatsApp and download on the
   phone).
7. On your phone, tap the file to install it. Android will warn about
   "installing from unknown sources" the first time — go to Settings and
   allow it for that app (this is normal for any app installed outside the
   Play Store, and it's free).

That's it — no Play Store fee, no Apple-style review process, no cost.

**Note:** this produces a *debug* build, which installs and runs completely
normally on any Android phone. If you eventually want to publish it on the
Play Store too, that build needs to be signed differently — let me know when
you're ready and I'll set that up.

## 4. Set up the backend (Supabase) — fresh start

This version uses a clean-slate backend design: **learners** (people taking
courses) and **admins** (people running the platform) are two completely
separate tables — an admin is never also counted as a learner.

**Steps:**

1. Create a free project at https://supabase.com (or reuse an existing one —
   see the reset note below if it already has old TeachPro tables in it).
2. Go to **Authentication → Providers**, make sure **Email** is enabled.
   Also go to **Authentication → Settings** and (for easiest testing) turn
   **off** "Confirm email" — otherwise new learner signups must click a
   confirmation link before they can log in. Turn this back on later for a
   real launch.
3. **If this project already has old tables from an earlier version** of
   this app, run `reset-everything.sql` first in the SQL Editor. This wipes
   every TeachPro table, function, and signed-up account (learners and
   admins alike) so you're starting completely clean. Skip this on a brand
   new project.
4. Run the entire contents of `supabase_schema.sql` in the SQL Editor. This
   creates `learners`, `admins`, `courses`, `lessons`, `quizzes`,
   `final_assessment_questions`, `enrollments`, and `certificate_requests` —
   and seeds your **first super admin account**:
   - Email: `09876545678`
   - Password: `09876545678`
   
   Log in with that immediately after setup and change the password from
   the app once you're in (Profile screen — coming for admin accounts too).
5. (Optional) Run `seed-demo-courses.sql` to load the 5 built-in demo
   courses into the database, so you have real content to look at and edit
   instead of starting from zero.
6. Go to **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key.
7. In the project folder, copy `.env.example` to `.env` and paste in those
   two values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
8. Restart `npm run dev` (or rebuild). The app auto-detects real credentials
   and switches out of demo mode.
9. For the GitHub Actions APK build to also use this backend, add the same
   two values as **repository secrets** (GitHub repo → Settings → Secrets
   and variables → Actions), named `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`, then add this to the "Build web app" step in
   `.github/workflows/build-apk.yml`:
   ```yaml
   - name: Build web app
     run: npm run build
     env:
       VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
       VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
   ```

## 5. Admins — a separate table, created directly with a password

Admins are **not** promoted teacher accounts anymore — they're created
directly by a super admin, with a name, email, and password, and they have
no learner profile at all. This is why an admin never shows up in the
Users tab or learner analytics: there's simply no row for them there.

- **super_admin** — full access to everything: Courses, Certificates,
  Users, Analytics, plus creating/removing other admins and
  disabling/enabling any learner's account.
- **admin** — scoped access to whichever tabs a super admin ticks for them
  (Certificates, Users, Analytics, Courses).

**Creating additional admins:** as a super admin, open the **Admins** tab
→ "Add New Admin" → fill in their name, email, password, and role/tabs →
"Create Admin Account". They can log in with that immediately, and can
update their own name/etc. after logging in.

**Removing an admin:** every admin except yourself has a "Remove Admin"
button. Unlike disabling a learner (reversible), removing an admin deletes
their login entirely — they'd need to be recreated from scratch to get
access back.

**A technical note on how admin creation works:** the browser's public API
key can never create login accounts directly (Supabase blocks this on
purpose, for security). Admin creation instead calls a database function
(`create_admin_account` in `supabase_schema.sql`) that runs with elevated
privileges but only after checking the caller is already a super admin —
so this door only opens one narrow, deliberate way.

**The Admin Dashboard is a desktop experience.** It uses a sidebar layout
meant for a wide browser window — pull it up on a computer, not the phone
app, when managing the platform.

This all requires Supabase to be connected (section 4). In demo mode (no
backend connected) the whole Admin Dashboard stays open for testing, since
there's no real learner/admin data to protect yet.

## 6. Managing course content (Courses tab)

Courses, lessons, quizzes, and final assessments are real, admin-editable
data — not something a developer has to touch in code. An admin with the
**content** permission (super admins always have it) sees a **Courses** tab:

- **Add a course** — title, category, description.
- **Add a lesson** — title, YouTube video link, text content, practical
  example, photos (image URLs), and Google Drive file links. Reorder
  lessons with the up/down arrows.
- **Manage a lesson's quiz** — click into a lesson to add/edit/delete its
  quiz questions (up to ~10 per lesson). A learner needs 70%+ across all of
  them to unlock the next lesson.
- **Final Assessment** — its own set of questions per course (up to ~20),
  managed the same way, separately from lesson quizzes.
- **Update Course** / **Delete Course** — edit the course's own details, or
  remove it and everything under it in one step (lessons, quizzes, final
  assessment questions). Deletion can't be undone.

Every signed-in learner can read course content the moment it's saved — no
separate publish step.

## 7. Lesson pacing — 24-hour lock on each lesson's quiz

Once a learner finishes a lesson and moves to the next one, that next
lesson's **content is available immediately** (video, text, resources) —
but its **quiz** stays locked for 24 hours from when the previous lesson
was completed. This is deliberate: it stops someone from blitzing through
every quiz back-to-back without ever reading the material, by guaranteeing
at least a day's worth of time to actually sit with each lesson before
being quizzed on it.

The lesson page shows "Quiz unlocks in Xh Ym" instead of the quiz while
it's locked, and it updates automatically without needing a refresh. This
is enforced directly in the code (not just hidden in the UI), so it can't
be bypassed by refreshing or trying to jump straight into the quiz.
Retaking a *failed* quiz has no extra wait — the 24-hour lock only applies
once, before a lesson's quiz opens for the first time.

If you're upgrading an existing project, run `add-lesson-pacing-lock.sql`
once in Supabase to add the column this feature needs.

## 8. In-app update notifications (no Play Store)

Since this app isn't distributed through the Play Store, it can't rely on
the Play Store to notify people about updates — so it checks for updates
itself, using GitHub's public Releases feature (free, no login required for
anyone downloading).

**One-time setup, after you've pushed this project to GitHub:**

1. Open `src/lib/version.ts` and set `GITHUB_REPO` to
   `"your-username/your-repo-name"`.
2. Rebuild and push.

**Every time you want to ship an update after that:**

1. Bump `APP_VERSION` in `src/lib/version.ts` (e.g. `'1.0'` → `'1.1'`),
   commit, and push to `main` as usual.
2. Tag that commit and push the tag — this is what actually triggers a
   public release:
   ```bash
   git tag v1.1
   git push origin v1.1
   ```
3. GitHub Actions builds the APK and publishes it as a **public Release**
   (unlike the regular build artifact, this download link needs no GitHub
   login — anyone can fetch it). Check the "Releases" section of your repo
   on GitHub to confirm it appeared.

From then on, every time someone opens the app, it quietly checks GitHub's
release feed. If the latest published version is newer than the version
baked into their installed copy, they'll see:

> **NEW UPDATE AVAILABLE**
> Important improvements are available.
> **[ UPDATE NOW ]**

Tapping it opens the new APK's direct download link in the browser — same
install flow as the very first install (allow "install from unknown
sources" if prompted). There's also a small "Not now" to dismiss it for
that session.

**Why version tags instead of just checking every push to `main`?** Cutting
an actual release (a tag) is a deliberate "ship it" action — you don't want
every small commit while you're mid-change to trigger a public update
notification to everyone's phone.

## 9. Login is by phone number, not email

Learners register and log in with their **phone number** (10–12 digits)
instead of an email address — easier to remember for most people. Behind
the scenes, Supabase Auth still technically requires an email for every
account, so the app quietly generates one from the phone number (something
like `2317701234@phone.teachpro.app`) — the learner never sees or types it.
Admin accounts are unaffected and still use a real email address; the Login
screen accepts either, auto-detecting which one was typed.

Registration also now asks for **Date of Birth**, used only for the
password-reset flow below.

## 10. Forgot Password (phone + birth year, no email/SMS needed)

Since there's no email or SMS infrastructure here, password reset works
differently: a learner enters the phone number their account uses and
their year of birth. If those match what's on file, they're shown a
"set new password" screen right away — no reset link, no waiting.

**Security tradeoff, stated plainly:** this is more convenient than an
email/SMS link, but also weaker — a phone number plus a roughly 80-year
birth-year range is a small, guessable space for anyone who already knows
the target's phone number. This was a deliberate choice for
low-connectivity users; if you later want stronger security, swapping this
for a real SMS OTP flow is the natural upgrade path.

**This only works for accounts that have a date of birth on file.**
Accounts created before this feature (or if you skip the field) won't be
resettable this way until their date of birth is added — currently that
means an admin updating it directly in Supabase's Table Editor, since
there's no in-app "add my missing birth date" flow yet.

## 11. Profile photos

Learners can tap their avatar on the Profile screen to upload a photo. It's
compressed client-side (resized and JPEG-compressed) to under 300KB before
upload — no huge images bloating your Supabase Storage usage. This needs
the `avatars` storage bucket set up, which `supabase_schema.sql` creates
automatically on a fresh install; run `add-phone-login-reset-avatars.sql`
if you're upgrading an existing project.

## 12. About / Terms & Conditions / Privacy Policy

Three new screens, linked from the Profile page: `src/pages/About.tsx`,
`Terms.tsx`, and `Privacy.tsx`. They currently contain clearly-marked
**placeholder text** — replace it with your organization's real, reviewed
content before a public launch. None of this is legal advice.

## 13. Running the Admin Dashboard on desktop, in a browser

The Android APK is for learners on their phones. The Admin Dashboard, on
the other hand, is built as a desktop layout and is meant to be opened in
a real browser on a computer — separately from the APK build, and without
touching `build-apk.yml` at all.

**Deploy it to Vercel (free, auto-updates on every push):**

1. Go to https://vercel.com and sign up using your GitHub account.
2. Click **Add New → Project**, then find and import your `teachpro-app`
   repository.
3. Vercel auto-detects this as a Vite project — leave the build settings as
   suggested (build command `npm run build`, output directory `dist`).
4. Before deploying, add your Supabase credentials as environment
   variables (Project Settings → Environment Variables), same as the
   GitHub Actions secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. After a minute or two you'll get a public URL like
   `https://teachpro-app.vercel.app`.
6. Open that URL on a desktop browser, log in with a super admin or admin
   account, and you'll land straight in the Admin Dashboard.

From then on, **every `git push` automatically redeploys this site** —
completely separate from the Android build. The two pipelines don't
interact at all: pushing code updates both the next APK build *and* this
website independently, with no shared configuration.

The included `vercel.json` is what makes direct links like `/admin` or
`/login` work correctly (without it, refreshing a page on a route other
than the homepage would 404 on most static hosts).

**Note:** this same URL also technically serves the learner-facing screens
in a browser (useful for quick testing without installing the APK), but
they're designed mobile-first — the Admin Dashboard is the part built
specifically for this desktop use case.

## 14. Where things live

- `src/pages/` — every learner-facing screen (Login, Register, Dashboard,
  Courses, Lesson, Final Assessment, Certificates, My Learning, Profile)
- `src/pages/admin/AdminDashboard.tsx` — the whole admin experience:
  Courses, Certificates, Users, Analytics, and Admins tabs, in a desktop
  sidebar layout
- `src/lib/version.ts` — the app's own version number and GitHub repo, used
  by the in-app update checker
- `src/lib/lessonLock.ts` — the 24-hour lesson pacing logic
- `src/data/courses.ts` — the 5 seeded demo courses (used only in demo
  mode; once Supabase is connected, course content comes from the database)
- `src/context/AppContext.tsx` — all app state (auth, courses, enrollments,
  progress, certificate requests) — switches automatically between demo
  mode and real Supabase calls, and between learner and admin identities
- `supabase_schema.sql` — the full backend schema, including the seeded
  first super admin
- `reset-everything.sql` — wipes all TeachPro tables/functions/accounts,
  for starting completely over on an existing project
- `seed-demo-courses.sql` — loads the built-in demo courses into the
  database
- `add-lesson-pacing-lock.sql` / `add-transaction-ref-uniqueness.sql` —
  incremental migrations for an existing project
- `android/` — the native Android project (auto-generated by Capacitor;
  don't hand-edit unless you know Android/Gradle)
- `.github/workflows/build-apk.yml` — the free cloud APK builder, now also
  publishing public Releases on version tags
- `vercel.json` — SPA routing config for the separate browser/desktop
  deployment (see section 13)

## 15. Certificates flow (per spec)

No online payment gateway and no certificate verification — matches your
latest decision:

1. Learner completes a course and passes the final assessment (≥70%).
2. Learner taps "Request Certificate," sends payment manually via Mobile
   Money to +231 88 852 4563, and submits a transaction reference in the
   app. That reference can't be reused on a second request — it's unique
   across the whole platform.
3. Request sits as "pending" until an admin manually confirms the payment.
4. Admin clicks "Confirm & Issue," pastes in the Google Drive link to the
   finished certificate, and it's delivered back to the learner through the
   app — with working View and Download buttons (Download uses Google
   Drive's direct-download link format so it actually downloads instead of
   just opening the viewer).
