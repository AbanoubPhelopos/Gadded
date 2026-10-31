import { t, useLocale } from './state/locale'
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { StoreProvider } from './state/store'

const Overview = lazy(() => import('./pages/Overview'))
const Technical = lazy(() => import('./pages/Technical'))
const Financial = lazy(() => import('./pages/Financial'))
const Site = lazy(() => import('./pages/Site'))
const Regulations = lazy(() => import('./pages/Regulations'))
const Vendors = lazy(() => import('./pages/Vendors'))
const Report = lazy(() => import('./pages/Report'))
const About = lazy(() => import('./pages/About'))

class ErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = {error: null as Error | null}
  static getDerivedStateFromError(error: Error) {return {error}}
  componentDidCatch(error: Error, info: ErrorInfo) {console.error('[gadded]', error, info.componentStack)}
  render() {return this.state.error ? <div className="fatal-error"><h1>{t("The workspace encountered an error.")}</h1><p>{t("Reload to start a fresh assessment.")}</p><button className="button primary" onClick={() => location.reload()}>{t("Reload workspace")}</button></div> : this.props.children}
}
export default function App() {
  useLocale()
  return <ErrorBoundary><StoreProvider><BrowserRouter><Suspense fallback={<div className="route-loading" role="status">{t("Loading workspace…")}</div>}><Routes><Route element={<AppShell/>}>
    <Route index element={<Overview/>}/><Route path="technical" element={<Technical/>}/><Route path="financial" element={<Financial/>}/><Route path="site" element={<Site/>}/><Route path="regulations" element={<Regulations/>}/><Route path="vendors" element={<Vendors/>}/><Route path="report" element={<Report/>}/><Route path="about" element={<About/>}/>
    <Route path="*" element={<div className="panel empty-state"><h2>{t("Page not found")}</h2><p>{t("This address doesn’t match a workspace page.")}</p><Link className="button primary" to="/">{t("Return to overview")}</Link></div>}/>
  </Route></Routes></Suspense></BrowserRouter></StoreProvider></ErrorBoundary>
}
