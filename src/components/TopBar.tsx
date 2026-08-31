import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function TopBar({
  title,
  back,
  admin,
  right,
}: {
  title: string
  back?: boolean
  admin?: boolean
  right?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <header
      className={`sticky top-0 z-30 text-white px-4 py-4 flex items-center gap-3 shadow-sm ${
        admin ? 'bg-black border-b-2 border-gold' : 'bg-navy'
      }`}
    >
      {back && (
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
      )}
      {admin && <ShieldCheck size={18} className="text-gold" />}
      <h1 className="text-base font-semibold truncate">{title}</h1>
      {admin && (
        <span className="ml-auto text-[10px] font-bold tracking-widest text-gold border border-gold rounded-full px-2 py-0.5">
          ADMIN
        </span>
      )}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  )
}
