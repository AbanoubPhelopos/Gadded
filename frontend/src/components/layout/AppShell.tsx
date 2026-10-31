import { t, useLocale } from '../../state/locale'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, ArrowDownToLine, ArrowRight, BookOpen, ChevronRight, CircleHelp, FileText, LayoutDashboard, Leaf, Loader2, MapPin, Menu, Plus, RotateCcw, Settings2, ShieldCheck, Sun, Wallet, X, Zap, Factory } from 'lucide-react'
import { useStore } from '../../state/store'
import { download } from '../../lib/api'
import { Badge, Note } from '../ui'
import Intake from '../assessment/Intake'
import Sources from '../assessment/Sources'

const navigation = [
  {path: '/', label: 'Overview', icon: LayoutDashboard}, {path: '/technical', label: 'Energy & sizing', icon: Zap},
  {path: '/financial', label: 'Financial outlook', icon: Wallet}, {path: '/site', label: 'Site & GIS', icon: MapPin},
  {path: '/regulations', label: 'Regulatory roadmap', icon: ShieldCheck}, {path: '/vendors', label: 'Vendor discovery', icon: Factory},
  {path: '/report', label: 'Assessment report', icon: FileText},
]
export function AppShell() {
  const {locale, setLocale} = useLocale(); const s = useStore(); const [menu, setMenu] = useState(false); const {pathname} = useLocation()
  const page = t(navigation.find(n => n.path === pathname)?.label || 'Page not found')
  useEffect(() => {setMenu(false); document.title = `${page} · Gadded`; window.scrollTo(0,0)}, [pathname, page])
  return <div className="app-layout">
    <a href="#main" className="skip-link">{t("Skip to assessment")}</a>
    {menu && <button className="nav-backdrop" onClick={() => setMenu(false)} aria-label={t("Close navigation")}/>}
    <aside className={`sidebar ${menu ? 'sidebar-open' : ''}`}>
      <NavLink to="/" className="brand"><span className="brand-symbol"><Zap size={23} fill="currentColor"/></span><span>{t("gadded")}<span className="brand-dot">{t(".")}</span><small>{t("SOLAR INTELLIGENCE")}</small></span></NavLink>
      <button className="new-button" disabled={s.loading || !s.input} onClick={() => s.setIntakeOpen(true)}><Plus size={16}/>{t("New assessment")}</button>
      <div className="nav-label">{t("YOUR WORKSPACE")}</div>
      <nav aria-label={t("Main navigation")}>{navigation.map(({path,label,icon: Icon}) => <NavLink key={path} to={path} end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={17}/><span>{t(label)}</span>{path === '/' && <span className="nav-count">{t("01")}</span>}</NavLink>)}</nav>
      <div className="sidebar-divider"/><div className="nav-label">{t("KNOWLEDGE & SUPPORT")}</div>
      <button className="nav-item" disabled={!s.data} onClick={() => s.setSourcesOpen(true)}><BookOpen size={17}/><span>{t("Sources & assumptions")}</span></button>
      <NavLink to="/about" className="nav-item"><CircleHelp size={17}/><span>{t("About this assessment")}</span></NavLink>
      <div className="sidebar-bottom"><div className="pitch-card"><Leaf size={19}/><strong>{t("Built for a brighter Egypt.")}</strong><p>{t("AI Empower Egypt 2026")}<br/>{t("Renewable Energy Track")}</p><span>{t("HACKATHON PROOF OF CONCEPT")}</span></div><div className="sidebar-footer"><span className="avatar">{t("G")}</span><div><strong>{t("Gadded workspace")}</strong><small>{t("Local demo · no account needed")}</small></div></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumbs"><button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label={t("Open navigation")}>{menu ? <X size={20}/> : <Menu size={20}/>}</button><span>{t("Workspace")}</span><ChevronRight size={14}/><strong>{page}</strong></div><div className="topbar-right"><label className="locale-picker"><span className="sr-only">{t('Language & region')}</span><select aria-label={t('Language & region')} value={locale} onChange={e => setLocale(e.target.value as 'en-GB' | 'ar-EG')}><option value="en-GB">English (UK)</option><option value="ar-EG">العربية (مصر)</option></select></label><span className={`engine-status ${s.loading ? 'busy' : ''}`}><i/>{s.loading ? t("Analysis in progress") : s.data ? t("Python engine connected") : t("Awaiting analysis")}</span><span className="country-label">{t("EGYPT ")}<span>{t("EG")}</span></span></div></header>
      <main id="main" className="main-content">
        <div className="page-heading"><div><p className="eyebrow">{t("INDUSTRIAL SOLAR · PRELIMINARY ASSESSMENT")}</p><h1>{page}</h1><p className="project-name"><MapPin size={13}/>{s.data?.input.projectName || t("10th of Ramadan City · Sharqia, Egypt")}</p></div><div className="heading-actions"><button className="button secondary" disabled={s.loading || !s.input} onClick={() => s.setIntakeOpen(true)}><Settings2 size={15}/>{t("Edit inputs")}</button><button className="button primary" disabled={!s.data || s.loading} onClick={() => s.data && download(s.data.reportHtml, `gadded-${s.data.result.runId}.html`, 'text/html')}><ArrowDownToLine size={15}/>{t("Export report")}</button></div></div>
        {s.dirty && <div className="dirty-banner"><span>{t("Inputs changed. These results belong to the previous run.")}</span><button disabled={s.loading} onClick={() => s.input && void s.run(s.input)}>{t("Run updated assessment")}<ArrowRight size={14}/></button></div>}
        {s.error && <div className="error-banner" role="alert"><div><strong>{t("We couldn’t complete this assessment.")}</strong><p>{s.error}</p></div><button className="button secondary" onClick={() => s.input ? void s.run(s.input) : void s.initialize()}><RotateCcw size={15}/>{t("Retry")}</button></div>}
        {s.loading ? <div className="loading-panel" role="status" aria-live="polite"><div className="loading-sun"><Sun size={36}/></div><p className="eyebrow">{t("POWERED BY YOUR PYTHON ANALYTICAL ENGINE")}</p><h2>{t("A clearer picture is taking shape.")}</h2><p>{t("Modeling your energy, optimizing system size, and simulating financial uncertainty.")}</p><div className="loading-stages"><span><Activity size={14}/>{t("Load-profile ML")}</span><span><Sun size={14}/>{t("PV physics")}</span><span><Loader2 size={14} className="spin"/>{t("Risk & feasibility")}</span></div><small>{t("Optional live AI searches can take several minutes. No estimated completion time is assumed.")}</small></div>
          : s.data ? <div className="page-enter"><Outlet/></div> : !s.error && <Note>{t("Start an assessment to see your results.")}</Note>}
        {s.data && !s.loading && <div className="run-footer"><span><Badge status={'info'}>{t("Analysis complete")}</Badge> {new Date(s.data.generatedAt).toLocaleString(locale, {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo'})} {t(" · Cairo time")}</span><code>{s.data.result.runId}</code></div>}
        <footer className="disclaimer"><ShieldCheck size={16}/><p><strong>{t("Preliminary decision support.")}</strong> {t(" Verify regulatory, engineering, grid, vendor, and financing information with the responsible authorities and qualified professionals.")}</p><span>{t("جدد · Gadded")}</span></footer>
      </main>
    </div>
    {s.intakeOpen && s.input && s.golden && <Intake input={s.input} golden={s.golden} onChange={s.setInput} metadata={s.metadata} onRun={ai => void s.run(s.input!, ai)} onClose={() => s.setIntakeOpen(false)}/>}
    {s.sourcesOpen && s.data && <Sources data={s.data} onClose={() => s.setSourcesOpen(false)}/>}
  </div>
}
