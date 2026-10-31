import type { AssessmentInput, AssessmentResponse } from '../data/types'

export async function getJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = body?.detail
    throw new Error(typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((e: {loc: string[]; msg: string}) => `${e.loc.slice(1).join('.')}: ${e.msg}`).join('; ')
      : `Unable to reach the assessment service (${response.status}). Please retry.`)
  }
  return response.json() as Promise<T>
}

export function assess(assessment: AssessmentInput, runLlm: boolean) {
  return getJson<AssessmentResponse>('/api/assessments', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({assessment, runLlm}),
  })
}

export function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], {type}))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function safeUrl(value?: string | null): string | undefined {
  if (!value) return undefined
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined } catch { return undefined }
}
