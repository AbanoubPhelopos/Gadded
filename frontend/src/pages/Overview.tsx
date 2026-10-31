import { t } from '../state/locale'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleDollarSign, Gauge, ShieldCheck, Sun, TrendingUp, Zap } from 'lucide-react'
import { useStore } from '../state/store'
import { Badge, Panel } from '../components/ui'
import { SolarIllustration } from '../components/ui/SolarIllustration'
import { EnergyChart } from '../components/charts/EnergyCharts'
import { compact, human, number, statusLabels } from '../lib/format'

export default function Overview() {
  const {data, setSourcesOpen} = useStore(); const [daily, setDaily] = useState(false)
  if (!data) return null
  const {result: r} = data; const tech = r.technical; const f = r.financial[0]
  const review = r.regulatoryFindings.filter(f => f.conclusion === 'requires_review' || f.severity !== 'info')
  const metrics = [
    {label: t("Recommended capacity"), value: number(tech.recommendedCapacityKw), unit: 'kWp', icon: Zap, foot: `${number(tech.evaluatedCapacitiesKw.length)} ${t('sizes evaluated')}`, tone: 'green'},
    {label: t("Annual solar generation"), value: compact(tech.annualGenerationKwh/1000), unit: 'MWh', icon: Sun, foot: t("Modeled with pvlib · cached weather"), tone: 'gold'},
    {label: t("Year-one net savings"), value: compact(f.yearOneSavingsEgp), unit: 'EGP', icon: CircleDollarSign, foot: `${human(f.scenario)} · ${t('after O&M')}`, tone: 'blue'},
    {label: t("Median payback"), value: number(r.risk.paybackP50Years, 1), unit: r.risk.paybackP50Years == null ? '' : t("years"), icon: TrendingUp, foot: `P10–P90: ${number(r.risk.paybackP10Years,1)}–${number(r.risk.paybackP90Years,1)} ${t('years')}`, tone: 'purple'},
  ]
  return <>
    <section className="hero"><div className="hero-content"><div className="hero-tag"><span/>{t("EVIDENCE-LED. ENERGY-FOCUSED.")}</div><h2>{t("Your rooftop.")}<br/>{t("A brighter bottom line.")}</h2><p>{t("From electricity bills to investment clarity.")}<br/>{t("Explore the opportunity above your factory.")}</p><Link to="/technical" className="hero-link">{t("Explore your solar potential")}<ArrowUpRight size={16}/></Link></div><SolarIllustration/><div className="hero-side-label"><Sun size={14}/>{t("POWERING EGYPT’S NEXT CHAPTER")}</div></section>
    <div className="section-line"><h2>{t("Your opportunity, at a glance")}</h2><button onClick={() => setSourcesOpen(true)}>{t("View assumptions")}<ArrowUpRight size={13}/></button></div>
    <div className="metric-grid">{metrics.map(({label,value,unit,icon: Icon,foot,tone}) => <div className="metric-card" key={label}><div className="metric-top"><span>{t(label)}</span><span className={`metric-icon ${tone}`}><Icon size={17}/></span></div><div className="metric-value">{value}<span>{unit}</span></div><p>{foot}</p></div>)}</div>
    <div className="overview-grid">
      <Panel title={t("A year of energy, in perspective")} eyebrow={t("GENERATION & DEMAND")} action={<div className="segmented"><button className={!daily ? 'selected' : ''} onClick={() => setDaily(false)}>{t("Monthly")}</button><button className={daily ? 'selected' : ''} onClick={() => setDaily(true)}>{t("Daily profile")}</button></div>}>
        <EnergyChart data={data} daily={daily}/><div className="chart-caption"><span className="caption-icon"><Zap size={14}/></span><p>{daily ? t("Average hour-of-day across the cached weather year; actual daily output varies.") : <>{t("Solar could cover ")}<strong>{number(tech.selfSufficiencyRatio*100,1)}{t("%")}</strong> {t(" of modeled annual factory demand. Monthly totals reconcile to your inputs.")}</>}</p></div>
      </Panel>
      <Panel title={t("Your feasibility snapshot")} eyebrow={t("THE PATH FORWARD")} className="feasibility-panel" action={<ShieldCheck size={19}/>}>
        <Badge status={r.status}/><h3>{r.status === 'feasible_with_conditions' ? t("An opportunity, with a few next steps.") : t(statusLabels[r.status])}</h3><p className="muted">{t("Determined by cited rules, site screening, and ownership evidence.")}</p>
        <div className="snapshot-items"><div><span className="check-circle"><Check size={12}/></span><div><strong>{t("Energy & economics modeled")}</strong><small>{number(r.risk.runCount)} {t(" seeded Monte Carlo scenarios")}</small></div></div><div><span className="check-circle neutral-circle"><Gauge size={12}/></span><div><strong>{number(review.length)} {t(" regulatory items to review")}</strong><small>{t("Confirm requirements with the authorities")}</small></div></div><div><span className="check-circle neutral-circle"><ShieldCheck size={12}/></span><div><strong>{t("Evidence stays visible")}</strong><small>{t("Coverage limitations are preserved")}</small></div></div></div><Link className="panel-link" to="/regulations">{t("See regulatory roadmap")}<ArrowRight size={15}/></Link>
      </Panel>
    </div>
    <div className="bottom-grid"><Panel title={t("Make more of the energy you generate")} eyebrow={t('Self-consumption')}><div className="utilization"><div className="donut" style={{'--progress': `${tech.selfConsumptionRatio*100}%`} as React.CSSProperties}><div><strong>{number(tech.selfConsumptionRatio*100,1)}<small>{t("%")}</small></strong><span>{t("used on site")}</span></div></div><div><h3>{t("Solar that works when you do.")}</h3><p className="muted">{number(tech.annualGenerationKwh*tech.selfConsumptionRatio/1000,1)} {t(" MWh of solar generation is matched to factory consumption each year.")}</p><Link to="/technical" className="text-link">{t("View energy breakdown")}<ChevronRight size={14}/></Link></div></div></Panel>
      <section className="investment-card"><div><span className="eyebrow">{t("INVEST WITH PERSPECTIVE")}</span><ArrowUpRight size={20}/></div><h3>{t("One forecast isn’t")}<br/>{t("the whole picture.")}</h3><p>{t("Explore a range of outcomes, from system cost to investment return.")}</p><Link to="/financial">{t("Explore financial uncertainty")}<ArrowRight size={15}/></Link></section></div>
  </>
}
