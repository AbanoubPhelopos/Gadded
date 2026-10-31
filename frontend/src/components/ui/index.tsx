import { t } from '../../state/locale'
import { useEffect, useRef, type ReactNode } from 'react'
import {AlertTriangle, ArrowUpRight, Check, Info, X} from 'lucide-react'
import {safeUrl} from '../../lib/api'
import {human, statusLabels} from '../../lib/format'
import type {Evidence} from '../../data/types'

export function Badge({status, children}: {status: string; children?: ReactNode}) {
  const tone = ['likely_feasible', 'info', 'source_supported'].includes(status) ? 'good' : ['critical', 'high_risk', 'potentially_ineligible'].includes(status) ? 'danger' : ['unknown', 'insufficient_information'].includes(status) ? 'neutral' : 'caution'
  return <span className={`badge ${tone}`}>{tone === 'good' ? <Check size={12}/> : tone === 'neutral' ? <Info size={12}/> : <AlertTriangle size={12}/>} {children || t(statusLabels[status] || human(status))}</span>
}
export function Panel({title, eyebrow, action, children, className = ''}: {title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string}) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>{children}</section>
}
export function Note({children, warning = false}: {children: ReactNode; warning?: boolean}) {
  return <div className={`note ${warning ? 'warning-note' : ''}`}><Info size={16}/><div>{children}</div></div>
}
export function SourceLink({url, children}: {url?: string | null; children: ReactNode}) {
  const href = safeUrl(url)
  return href ? <a className="source-link" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={13}/></a> : <span>{children}</span>
}
export function EvidenceList({evidence}: {evidence: Evidence[]}) {
  return <div className="evidence-list">{evidence.map((e, i) => <div key={i}><SourceLink url={e.url}>{e.title}</SourceLink><p>{e.supportingText}</p><small>{t("Retrieved ")}{e.retrievedAt}</small></div>)}</div>
}
export function Modal({title, children, onClose, wide = false}: {title: string; children: ReactNode; onClose: () => void; wide?: boolean}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current!; const previous = document.activeElement as HTMLElement | null
    el.showModal()
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => {el.close(); document.body.style.overflow = old; previous?.focus()}
  }, [])
  return <dialog ref={ref} className={`modal ${wide ? 'wide-modal' : ''}`} onCancel={onClose} onClick={e => {if (e.target === e.currentTarget) onClose()}} aria-label={title}>
    <div className="modal-heading"><div><p className="eyebrow">{t("GADDED WORKSPACE")}</p><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label={t("Close dialog")}><X size={20}/></button></div>{children}
  </dialog>
}
