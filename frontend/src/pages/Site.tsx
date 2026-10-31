import { t } from '../state/locale'
import { MapPin, ArrowUpRight } from 'lucide-react'
import { useStore } from '../state/store'
import { Badge, Note, Panel, SourceLink } from '../components/ui'
import { number } from '../lib/format'

export default function Site() {
  const {data, metadata} = useStore(); if (!data) return null
  const {latitude,longitude} = data.input.location
  return <div className="space-y-5"><p className="original-evidence">{t('Original-language evidence (English).')}</p><div className="site-location"><div className="site-grid" aria-hidden="true"><div className="map-roads"/><div className="site-pin"><MapPin size={28}/></div><span>{t("SCHEMATIC SITE LOCATOR · NOT A SURVEY MAP")}</span></div><div><p className="eyebrow">{t("SELECTED PROJECT SITE")}</p><h2>{data.input.location.industrialZone || t("10th of Ramadan City")}</h2><p>{data.input.location.address}</p><code>{latitude.toFixed(4)}{t("° N · ")}{longitude.toFixed(4)}{t("° E")}</code><SourceLink url={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}>{t("Open location in OpenStreetMap")}<ArrowUpRight size={13}/></SourceLink></div></div>
    <Note warning>{metadata?.coverageNotice} {t(" The schematic above is illustrative. The findings below come from the local GIS layers.")}</Note>
    <Panel title={t("What the available layers tell us")} eyebrow={t("SOURCE-AWARE SITE SCREENING")}><div className="finding-list">{data.result.gisFindings.map(f => <article key={f.code} className="finding"><div className="finding-heading"><h3>{f.title}</h3><Badge status={f.severity}/></div><p className="site-value">{f.value == null ? t("Unknown / not covered") : typeof f.value === 'number' ? number(f.value,2) : String(f.value)} {f.unit}</p><p>{f.methodology}</p><small>{t("Source: ")}{f.sourceName} {f.sourceDate && `· ${f.sourceDate}`}</small>{f.limitations.length > 0 && <details className="disclosure"><summary>{t("Coverage & limitations")}</summary><ul>{f.limitations.map((l,i) => <li key={i}>{l}</li>)}</ul></details>}</article>)}</div></Panel>
    <Note>{t("Absence from a mapped dataset does not prove infrastructure or restrictions are absent. Distances are screening estimates; grid capacity remains unconfirmed.")}</Note>
  </div>
}
