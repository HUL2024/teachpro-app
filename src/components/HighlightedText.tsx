// Parses simple **term** markup into highlighted spans. Kept intentionally
// tiny -- this is not a full markdown renderer, just enough for admins to
// call out key terms/new topics within an otherwise plain paragraph.
export default function HighlightedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p className={className}>
      {parts.map((part, i) => {
        const match = part.match(/^\*\*([^*]+)\*\*$/)
        if (match) {
          return (
            <mark key={i} className="bg-gold/25 text-navy font-semibold px-0.5 rounded">
              {match[1]}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
