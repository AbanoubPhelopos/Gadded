import { t } from '../state/locale'
import { useStore } from '../state/store'
import { Note, Panel } from '../components/ui'
import { CandidateChart, EnergyChart } from '../components/charts/EnergyCharts'
import { human, number } from '../lib/format'

export default function Technical() {
  const {data} = useStore(); if (!data) return null
  const tech = data.result.technical
  return <div className="space-y-5"><div className="mini-metrics">{[[t("Recommended system"), `${number(tech.recommendedCapacityKw)} kWp`], [t("Physical roof maximum"), `${number(tech.physicalMaximumKw)} kWp`], [t("Area required"), `${number(tech.roofAreaRequiredM2)} m²`], [t("Self-sufficiency"), `${number(tech.selfSufficiencyRatio*100,1)}%`]].map(([label,value]) => <div key={label}><span>{t(label)}</span><strong>{value}</strong></div>)}</div>
    <div className="two-col"><Panel title={t("Solar meets your working day")} eyebrow={t("AVERAGE HOURLY PROFILE")}><EnergyChart data={data} daily/><p className="chart-summary">{t("Average power by local hour across the weather year. Load-profile ML uses synthetic archetypes; PV is modeled with physics.")}</p></Panel><Panel title={t("Sizing for financial value")} eyebrow={t("CONSTRAINED OPTIMIZATION")}><CandidateChart data={data}/><p className="chart-summary">{t("Maximizes NPV over ")}{tech.evaluatedCapacitiesKw.length} {t(" sizes. Binding constraint: ")}<strong>{tech.bindingConstraints.map(human).join(', ')}</strong>{t(".")}</p></Panel></div>
    <Panel title={t("Where the energy goes")}><dl className="detail-list"><div><dt>{t("Annual factory consumption")}</dt><dd>{number(tech.annualLoadKwh)} {t(" kWh")}</dd></div><div><dt>{t("Solar generation")}</dt><dd>{number(tech.annualGenerationKwh)} {t(" kWh")}</dd></div><div><dt>{t("Grid imports after solar")}</dt><dd>{number(tech.annualImportedKwh)} {t(" kWh")}</dd></div><div><dt>{t("Surplus generation")}</dt><dd>{number(tech.annualExportedKwh)} {t(" kWh")}</dd></div><div><dt>{t("Solar used on site")}</dt><dd>{number(tech.selfConsumptionRatio*100,1)}{t("%")}</dd></div><div><dt>{t("Load-model confidence")}</dt><dd>{data.loadModel.confidence} {t(" · ")}{data.loadModel.archetypeId}</dd></div><div><dt>{t("Monthly reconciliation error")}</dt><dd>{number(data.loadModel.reconciliationErrorPct,6)}{t("%")}</dd></div></dl><Note>{t("Self-consumption assumes no revenue for surplus generation. This is a preliminary energy model; export controls, structural capacity, and grid connection need an engineering study.")}</Note></Panel>
  </div>
}
