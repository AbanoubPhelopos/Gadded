/** Real API -> React SSR smoke check. Complements, but does not replace, browser QA. */
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../src/state/locale'
import { AssessmentContext } from '../src/state/store'
import { number } from '../src/lib/format'
import type { AssessmentInput, AssessmentResponse, Metadata } from '../src/data/types'
import { AppShell } from '../src/components/layout/AppShell'
import Intake from '../src/components/assessment/Intake'
import Sources from '../src/components/assessment/Sources'
import Overview from '../src/pages/Overview'
import Technical from '../src/pages/Technical'
import Financial from '../src/pages/Financial'
import Site from '../src/pages/Site'
import Regulations from '../src/pages/Regulations'
import Vendors from '../src/pages/Vendors'
import Report from '../src/pages/Report'
import About from '../src/pages/About'

const base = process.env.GADDED_TEST_URL || 'http://localhost:8080'
const input = await fetch(`${base}/api/defaults`).then(r => r.json()) as AssessmentInput
const metadata = await fetch(`${base}/api/metadata`).then(r => r.json()) as Metadata
const response = await fetch(`${base}/api/assessments`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({assessment:input,runLlm:false})})
assert.equal(response.status,200)
const data = await response.json() as AssessmentResponse
const noop = () => {}
const state = {input,golden:input,data,metadata,loading:false,error:null,intakeOpen:false,sourcesOpen:false,
  setInput:noop,setIntakeOpen:noop,setSourcesOpen:noop,run:async()=>{},initialize:async()=>{},dirty:false}
const components = {Overview,Technical,Financial,Site,Regulations,Vendors,Report,About,AppShell}
let count = 0
for (const locale of ['en-GB','ar-EG'] as const) {
  Object.defineProperty(globalThis, 'localStorage', {value: {getItem:()=>locale}, configurable:true})
  for (const [name,Page] of Object.entries(components)) {
    const html = renderToStaticMarkup(<LocaleProvider><AssessmentContext.Provider value={state}><MemoryRouter><Page/></MemoryRouter></AssessmentContext.Provider></LocaleProvider>)
    assert(html.length > 300,`${name}/${locale} did not render`)
    assert(!html.includes('NaN'),`${name}/${locale} contains NaN`)
    if (locale === 'ar-EG') assert(/[\u0600-\u06ff]/.test(html),`${name} has no Arabic copy`)
    if (name === 'Overview') assert(html.includes(locale === 'ar-EG' ? 'سطح مصنعك.' : 'Your rooftop.'))
    if (name === 'AppShell') assert(html.includes('value="en-GB"') && html.includes('value="ar-EG"'))
    count++
  }
  const intake = renderToStaticMarkup(<LocaleProvider><Intake input={input} golden={input} metadata={metadata} onChange={noop} onRun={noop} onClose={noop}/></LocaleProvider>)
  assert(intake.includes(locale === 'ar-EG' ? 'إعداد التقييم' : 'Configure your assessment'))
  const sources = renderToStaticMarkup(<LocaleProvider><Sources data={data} onClose={noop}/></LocaleProvider>)
  assert(sources.includes(locale === 'ar-EG' ? 'سجل الافتراضات' : 'Assumptions register'))
  assert.equal(number(null),locale === 'ar-EG' ? 'غير متاح' : 'Unavailable')
  assert.equal(number(1234.5,1), new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(1234.5))
  count += 4
}
console.log(`${count} React rendering and locale checks passed against the running Docker API.`)
