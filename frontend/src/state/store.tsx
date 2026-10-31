import { t } from './locale'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { assess, getJson } from '../lib/api'
import type { AssessmentInput, AssessmentResponse, Metadata } from '../data/types'

function useAssessmentState() {
  const [input, setInput] = useState<AssessmentInput | null>(null)
  const [golden, setGolden] = useState<AssessmentInput | null>(null)
  const [data, setData] = useState<AssessmentResponse | null>(null)
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intakeOpen, setIntakeOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const running = useRef(false)
  const started = useRef(false)
  const run = useCallback(async (values: AssessmentInput, ai = false) => {
    if (running.current) return
    running.current = true; setLoading(true); setError(null); setIntakeOpen(false)
    try { setData(await assess(values, ai)) }
    catch (e) {setError(e instanceof Error ? e.message : t("Assessment failed. Please retry."))}
    finally {setLoading(false); running.current = false}
  }, [])
  const initialize = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [defaults, meta] = await Promise.all([getJson<AssessmentInput>('/api/defaults'), getJson<Metadata>('/api/metadata')])
      setInput(defaults); setGolden(defaults); setMetadata(meta)
      await run(defaults)
    } catch(e) {setError(e instanceof Error ? e.message : t("Could not connect to the API.")); setLoading(false)}
  }, [run])
  useEffect(() => {if (!started.current) {started.current = true; void initialize()}}, [initialize])
  const dirty = !!(data && input && JSON.stringify(input) !== JSON.stringify(data.input))
  return {input, setInput, golden, data, metadata, loading, error, intakeOpen, setIntakeOpen,
    sourcesOpen, setSourcesOpen, run, initialize, dirty}
}
type Store = ReturnType<typeof useAssessmentState>
export const AssessmentContext = createContext<Store | null>(null)
export function StoreProvider({children}: {children: ReactNode}) {
  const state = useAssessmentState()
  return <AssessmentContext.Provider value={state}>{children}</AssessmentContext.Provider>
}
export function useStore() {
  const state = useContext(AssessmentContext)
  if (!state) throw new Error('Assessment store must be inside StoreProvider')
  return state
}
