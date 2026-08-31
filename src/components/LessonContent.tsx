// A tiny, intentional markup -- not full markdown. Supports exactly three
// things admins need:
//   - a line starting with "# " or "## " becomes a heading, regardless of
//     whether there are blank lines around it
//   - a blank line starts a new paragraph
//   - **term** highlights a key word/phrase in gold
// Everything else collapses into flowing paragraph text.

function parseInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/)
    if (match) {
      return (
        <mark key={`${keyPrefix}-${i}`} className="bg-gold/25 text-navy font-semibold px-0.5 rounded">
          {match[1]}
        </mark>
      )
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>
  })
}

type Block = { type: 'h1' | 'h2' | 'p'; text: string }

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let buffer: string[] = []

  function flush() {
    const joined = buffer.join(' ').trim()
    if (joined) blocks.push({ type: 'p', text: joined })
    buffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === '') {
      flush()
      continue
    }
    if (line.startsWith('## ')) {
      flush()
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      continue
    }
    if (line.startsWith('# ')) {
      flush()
      blocks.push({ type: 'h1', text: line.slice(2).trim() })
      continue
    }
    buffer.push(line)
  }
  flush()

  return blocks
}

// For short card/teaser previews where full heading/paragraph rendering
// doesn't make sense -- strips the markup symbols so they never show up
// literally, without doing full block rendering.
export function stripLessonMarkup(text: string): string {
  return (text || '')
    .split('\n')
    .map((line) => line.trim().replace(/^#{1,2}\s+/, ''))
    .join(' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function LessonContent({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text || '')

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.type === 'h1') {
          return (
            <h3 key={i} className="text-base font-bold text-navy mt-4 mb-2 first:mt-0">
              {parseInline(block.text, `h1-${i}`)}
            </h3>
          )
        }
        if (block.type === 'h2') {
          return (
            <h4 key={i} className="text-sm font-bold text-navy mt-4 mb-1.5 first:mt-0">
              {parseInline(block.text, `h2-${i}`)}
            </h4>
          )
        }
        return (
          <p key={i} className="text-sm text-gray-700 leading-relaxed mt-3 first:mt-0">
            {parseInline(block.text, `p-${i}`)}
          </p>
        )
      })}
    </div>
  )
}
