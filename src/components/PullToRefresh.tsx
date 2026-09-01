import { useRef, useState, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 70 // px of downward drag needed to trigger a refresh
const MAX_PULL = 100 // visual cap so the indicator doesn't stretch forever

export default function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void>
  children: ReactNode
}) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pulling = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    // Only start tracking a pull gesture if the page is already scrolled
    // all the way to the top -- otherwise this would hijack normal
    // mid-page scrolling.
    if (window.scrollY <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY
      pulling.current = true
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!pulling.current || startY.current === null) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0 && window.scrollY <= 0) {
      // Prevent the page itself from scrolling while actively pulling, so
      // the gesture feels like a dedicated pull-down rather than a scroll.
      e.preventDefault()
      setPullDistance(Math.min(diff * 0.5, MAX_PULL))
    } else {
      pulling.current = false
      setPullDistance(0)
    }
  }

  async function handleTouchEnd() {
    if (!pulling.current) return
    pulling.current = false
    startY.current = null

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const showSpinner = pullDistance > 0 || refreshing
  const spinnerProgress = Math.min(pullDistance / THRESHOLD, 1)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: showSpinner ? Math.max(pullDistance, refreshing ? THRESHOLD : 0) : 0 }}
      >
        <RefreshCw
          size={20}
          className={`text-brand-green ${refreshing ? 'animate-spin' : ''}`}
          style={{
            transform: refreshing ? undefined : `rotate(${spinnerProgress * 360}deg)`,
            opacity: Math.max(spinnerProgress, refreshing ? 1 : 0),
          }}
        />
      </div>
      {children}
    </div>
  )
}
