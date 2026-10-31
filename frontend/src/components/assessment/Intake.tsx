import { t, activeLocale } from '../../state/locale'
import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, FlaskConical, Play, Sparkles } from 'lucide-react'
import { Modal, Note } from '../ui'
import { number } from '../../lib/format'
import type { AssessmentInput, Metadata } from '../../data/types'

export const presets = [
  {id: 'golden', name: 'Golden case', detail: '3,000 m² · food processing'},
  {id: 'ownership', name: 'Unknown ownership', detail: 'Test missing information'},
  {id: 'protected', name: 'Protected area', detail: 'Synthetic GIS risk scenario'},
  {id: 'large', name: 'Large rooftop', detail: '20,000 m² · optimize size'},
]
export function makePreset(golden: AssessmentInput, id: string): AssessmentInput {
  const next = structuredClone(golden)
  if (id === 'ownership') {next.site.ownershipStatus = 'unknown'; next.projectName = 'Ownership-unverified factory'}
  if (id === 'protected') {next.location.latitude = 30.345; next.location.longitude = 31.815; next.projectName = 'Protected-area demo site'; next.location.address = 'Synthetic protected-area test site, near 10th of Ramadan City'}
  if (id === 'large') {next.site.availableRoofAreaM2 = 20000; next.projectName = 'Large industrial rooftop'}
  return next
}

interface Props {input: AssessmentInput; golden: AssessmentInput; onChange: (input: AssessmentInput) => void; onRun: (ai: boolean) => void; onClose: () => void; metadata: Metadata | null}
export default function Intake({input, golden, onChange, onRun, onClose, metadata}: Props) {
  const [step, setStep] = useState(0)
  const [ai, setAi] = useState(false)
  const [preset, setPreset] = useState('golden')
  const update = <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => onChange({...input, [key]: value})
  const setLocation = (key: keyof AssessmentInput['location'], value: number | string) => update('location', {...input.location, [key]: value})
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); if (step < 2) setStep(step+1); else onRun(ai) }
  return <Modal title={t("Configure your assessment")} onClose={onClose} wide>
    <div className="stepper">{[t("Project & site"), t("Energy profile"), t("Finance & review")].map((title, i) => <button key={title} className={i === step ? 'current' : ''} onClick={() => setStep(i)}><span>{i < step ? <Check size={13}/> : `0${i+1}`}</span>{t(title)}</button>)}</div>
    <form onSubmit={submit}>
      <div className="intake-body">
        <div className="preset-picker"><div><FlaskConical size={17}/><span>{t("Start with a scenario")}</span></div><select aria-label={t("Assessment scenario")} value={preset} onChange={e => {setPreset(e.target.value); onChange(makePreset(golden, e.target.value))}}>{presets.map(p => <option key={p.id} value={p.id}>{t(p.name)} {t(" — ")}{t(p.detail)}</option>)}</select></div>
        {step === 0 && <div className="form-section"><h3>{t("A little context for your rooftop.")}</h3><p className="muted">{t("All fields are required unless marked optional. This demo covers the 10th of Ramadan area.")}</p>
          <label className="field">{t("Project name")}<input required maxLength={200} value={input.projectName} onChange={e => update('projectName', e.target.value)}/></label>
          <div className="form-grid"><label className="field">{t("Latitude")}<input type="number" step="any" required min={30.2203} max={30.4203} value={input.location.latitude} onChange={e => setLocation('latitude', Number(e.target.value))}/></label><label className="field">{t("Longitude")}<input type="number" step="any" required min={31.6466} max={31.8466} value={input.location.longitude} onChange={e => setLocation('longitude', Number(e.target.value))}/></label></div>
          <label className="field">{t("Site address")}<input required value={input.location.address || ''} onChange={e => setLocation('address', e.target.value)}/></label>
          <div className="form-grid"><label className="field">{t("Available rooftop area (m²)")}<input type="number" required min={1} max={30000} value={input.site.availableRoofAreaM2} onChange={e => update('site', {...input.site, availableRoofAreaM2: Number(e.target.value)})}/></label><label className="field">{t("Site ownership")}<select value={input.site.ownershipStatus} onChange={e => update('site', {...input.site, ownershipStatus: e.target.value as AssessmentInput['site']['ownershipStatus']})}><option value="owned">{t("Owned")}</option><option value="rented_authorized">{t("Rented · authorized")}</option><option value="rented_unknown">{t("Rented · authorization unknown")}</option><option value={'unknown'}>{t("Unknown")}</option></select></label></div>
          <Note>{t("Cached NASA POWER weather is used for this area. The protected-area preset contains a labelled synthetic boundary for demonstration.")}</Note>
        </div>}
        {step === 1 && <div className="form-section"><h3>{t("Understand how your factory uses energy.")}</h3><p className="muted">{t("Monthly totals anchor the ML profile. Enter consumption from your electricity bills.")}</p>
          <div className="form-grid"><label className="field">{t("Industrial sector")}<select value={input.factory.sector} onChange={e => update('factory', {...input.factory, sector: e.target.value as AssessmentInput['factory']['sector']})}><option value="food_processing">{t("Food processing")}</option><option value={'textiles'}>{t("Textiles")}</option></select></label><label className="field">{t("Working days per week")}<input type="number" required min={1} max={7} value={input.factory.workingDaysPerWeek} onChange={e => update('factory', {...input.factory, workingDaysPerWeek: Number(e.target.value)})}/></label></div>
          <div className="form-grid"><label className="field">{t("Operating pattern")}<select value={input.factory.shiftPattern} onChange={e => update('factory', {...input.factory, shiftPattern: e.target.value as AssessmentInput['factory']['shiftPattern']})}><option value="day_shift">{t("Day shift")}</option><option value="two_shifts">{t("Two shifts")}</option><option value="continuous">{t("Continuous operation")}</option></select></label><label className="field">{t("Consumption entry")}<select value={input.factory.monthlyConsumptionKwh.length === 1 ? 'single' : 'monthly'} onChange={e => update('factory', {...input.factory, monthlyConsumptionKwh: e.target.value === 'single' ? [input.factory.monthlyConsumptionKwh[0]] : Array(12).fill(input.factory.monthlyConsumptionKwh[0])})}><option value="monthly">{t("12 monthly readings")}</option><option value="single">{t("One representative month")}</option></select></label></div>
          <p className="field-label">{t("Electricity consumption (kWh)")}</p><div className="month-grid">{input.factory.monthlyConsumptionKwh.map((value, i) => <label className="field" key={i}>{input.factory.monthlyConsumptionKwh.length === 1 ? t("Monthly average") : new Date(2025, i).toLocaleString(activeLocale, {month: 'short'})}<input type="number" min={1} required value={value} onChange={e => {const values = [...input.factory.monthlyConsumptionKwh]; values[i] = Number(e.target.value); update('factory', {...input.factory, monthlyConsumptionKwh: values})}}/></label>)}</div>
          <Note>{t("The load model uses synthetic training archetypes. It reconciles the predicted hourly energy to your monthly totals; it does not replace a measured load study.")}</Note>
        </div>}
        {step === 2 && <div className="form-section"><h3>{t("Set your investment priorities.")}</h3><p className="muted">{t("Financial assumptions and their sources stay visible with every result.")}</p>
          <div className="form-grid"><label className="field">{t("Connection model")}<select value={input.connectionModel} onChange={e => update('connectionModel', e.target.value as AssessmentInput['connectionModel'])}><option value="self_consumption">{t("Self-consumption")}</option><option value="net_metering">{t("Net metering")}</option></select></label><label className="field">{t("Investment scenario")}<select value={input.finance.preference} onChange={e => update('finance', {...input.finance, preference: e.target.value as AssessmentInput['finance']['preference']})}><option value="compare">{t("Compare cash & finance")}</option><option value={'cash'}>{t("Cash purchase")}</option><option value={'finance'}>{t("Financed purchase")}</option></select></label></div>
          <div className="form-grid"><label className="field">{t("Target payback (years)")}<input type="number" min={.1} max={50} step=".1" required value={input.finance.targetPaybackYears ?? 6} onChange={e => update('finance', {...input.finance, targetPaybackYears: Number(e.target.value)})}/></label><label className="field">{t("Budget ceiling (EGP) · optional")}<input type="number" min={1} placeholder={t("No ceiling")} value={input.finance.budgetCeilingEgp ?? ''} onChange={e => update('finance', {...input.finance, budgetCeilingEgp: e.target.value ? Number(e.target.value) : null})}/></label></div>
          <div className="review-card"><span>{t("YOUR ASSESSMENT AT A GLANCE")}</span><strong>{input.projectName}</strong><p>{number(input.site.availableRoofAreaM2)} {t(" m² rooftop · ")}{t(input.factory.sector.replace('_', ' '))} {t(" · ")}{t(input.connectionModel.replace('_', ' '))}</p></div>
          <label className="ai-switch"><input type="checkbox" disabled={!metadata?.regulatoryAiAvailable && !metadata?.discoveryAvailable} checked={ai} onChange={e => setAi(e.target.checked)}/><span><strong><Sparkles size={15}/> {t(" Include live AI & web discovery")}</strong><small>{t("Optional cited explanation, vendor and financing search. May take several minutes. ")}{metadata?.discoveryAvailable ? t("Providers configured.") : t('AI is not configured yet. Add your .env later; the core assessment works without providers.')}</small></span></label>
          <Note>{t("Preliminary decision support. Verify engineering, grid, regulatory, vendor, and financing information with qualified professionals.")}</Note>
        </div>}
      </div>
      <div className="modal-footer"><button type="button" className="button secondary" onClick={() => step ? setStep(step-1) : onClose()}><ArrowLeft size={15}/>{step ? t("Back") : t("Close")}</button><span className="muted small">{t("Step ")}{step+1} {t(" of 3")}</span><button type="submit" className="button primary">{step === 2 ? <><Play size={14}/> {t(" Run assessment")}</> : <>{t("Continue")}<ArrowRight size={15}/></>}</button></div>
    </form>
  </Modal>
}
