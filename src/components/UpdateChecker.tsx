import { useEffect, useState } from 'react'
import { APP_VERSION, GITHUB_REPO } from '../lib/version'
import { compareVersions } from '../lib/compareVersions'
import { Sparkles } from 'lucide-react'

interface ReleaseInfo {
  version: string
  downloadUrl: string
  notes: string
}

// There's no Play Store to push updates through, so the app checks GitHub's
// public Releases API itself on launch. No login or token needed -- it's a
// public, unauthenticated endpoint. This only works once GITHUB_REPO (in
// src/lib/version.ts) is filled in and at least one release tag (e.g. v1.1)
// has been pushed -- see the README section on cutting a new release.
export default function UpdateChecker() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!GITHUB_REPO) return
    let active = true

    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return
        const latestVersion = String(data.tag_name || '').replace(/^v/i, '')
        if (!latestVersion) return
        if (compareVersions(latestVersion, APP_VERSION) <= 0) return

        const apkAsset = (data.assets || []).find((a: any) => a.name?.endsWith('.apk'))
        if (!apkAsset) return

        setRelease({
          version: latestVersion,
          downloadUrl: apkAsset.browser_download_url,
          notes: data.body || 'Important improvements are available.',
        })
      })
      .catch(() => {
        // Silently ignore -- no internet, rate-limited, or repo not public
        // yet. An update check failing should never block using the app.
      })

    return () => {
      active = false
    }
  }, [])

  if (!release || dismissed) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
        <div className="bg-gold/15 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
          <Sparkles size={26} className="text-gold" />
        </div>
        <p className="text-xs text-gray-400 mb-1">
          Current version: {APP_VERSION} · Latest version: {release.version}
        </p>
        <h2 className="text-lg font-bold text-navy mb-1">NEW UPDATE AVAILABLE</h2>
        <p className="text-sm text-gray-500 mb-5">{release.notes}</p>
        <a
          href={release.downloadUrl}
          className="block w-full bg-brand-green text-white font-semibold py-3 rounded-lg text-sm"
        >
          UPDATE NOW
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="mt-3 text-xs text-gray-400 font-medium"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
