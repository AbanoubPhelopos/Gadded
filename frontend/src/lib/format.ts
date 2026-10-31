import {activeLocale, t} from '../state/locale'
export const number = (n: number | null | undefined, digits = 0) => n == null ? t('Unavailable') : new Intl.NumberFormat(activeLocale, {maximumFractionDigits: digits}).format(n)
export const compact = (n: number) => new Intl.NumberFormat(activeLocale, {notation: 'compact', maximumFractionDigits: 2}).format(n)
export const human = (s: string) => t(s.replaceAll('_', ' '))
export const statusLabels: Record<string, string> = {likely_feasible: 'Likely feasible', feasible_with_conditions: 'Feasible with conditions', high_risk: 'High site / regulatory risk', potentially_ineligible: 'Potentially ineligible', insufficient_information: 'Insufficient information'}


export const dateTime = (value: string) => new Date(value).toLocaleString(activeLocale, {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo'})
