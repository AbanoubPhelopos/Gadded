import { t } from '../state/locale'
import { Factory, Search, Settings2 } from 'lucide-react'
import { useStore } from '../state/store'
import { Badge, EvidenceList, Note, Panel, SourceLink } from '../components/ui'
import { number } from '../lib/format'

export default function Vendors() {
  const {data, setIntakeOpen} = useStore(); if (!data) return null
  return <div className="space-y-5"><Note>{t("Vendor leads are source-supported discovery results, not quality rankings or endorsements. Independently verify capability, licenses, references, and commercial terms.")}</Note><Panel title={t("Find the right conversation to start")} eyebrow={t("EVIDENCE-GROUNDED EPC DISCOVERY")} action={<Badge status={'info'}>{number(data.result.technical.recommendedCapacityKw)} {t(" kWp project")}</Badge>}>
    {data.result.vendors.length ? <div className="vendor-grid">{data.result.vendors.map(v => <article className="vendor-card" key={v.name}><div className="vendor-logo"><Factory size={25}/></div><h3>{v.name}</h3><Badge status={v.verificationStatus}/><p>{v.fitExplanation}</p><div className="tag-list">{v.services.map(service => <span key={service}>{service}</span>)}</div><SourceLink url={v.websiteUrl}>{t("Company website")}</SourceLink>{v.contactEmail && <p>{t("Email: ")}{v.contactEmail}</p>}{v.contactPhone && <p>{t("Phone: ")}{v.contactPhone}</p>}<details className="disclosure"><summary>{t("Inspect supporting evidence")}</summary><EvidenceList evidence={v.evidence}/></details></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={29}/></span><h3>{data.runLlm ? t("No source-supported candidates this run") : t("Vendor discovery is ready when you are")}</h3><p>{data.vendorWarnings.map(w => t(w)).join(' ') || t("The search did not return verifiable evidence. Your technical and financial results remain available.")}</p><button className="button primary" onClick={() => setIntakeOpen(true)}><Settings2 size={15}/>{t("Configure live discovery")}</button><small>{t("Enable live AI in step 3. Requires server-side Gemini and Groq keys.")}</small></div>}
  </Panel></div>
}
