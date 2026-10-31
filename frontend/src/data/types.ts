export interface AssessmentInput {
  projectId: string; projectName: string; projectType: 'industrial_rooftop';
  connectionModel: 'self_consumption' | 'net_metering';
  location: { latitude: number; longitude: number; address?: string | null; governorate?: string | null; industrialZone?: string | null };
  factory: { sector: 'food_processing' | 'textiles'; monthlyConsumptionKwh: number[]; workingDaysPerWeek: number; shiftPattern: 'day_shift' | 'two_shifts' | 'continuous'; shiftStartHour?: number | null; shiftEndHour?: number | null };
  site: { availableRoofAreaM2: number; ownershipStatus: 'owned' | 'rented_authorized' | 'rented_unknown' | 'unknown'; roofType?: string | null; connectionVoltage?: string | null; targetCapacityKw?: number | null };
  finance: { preference: 'cash' | 'finance' | 'compare'; targetPaybackYears?: number | null; budgetCeilingEgp?: number | null };
  timeline: { targetCommissioningDate?: string | null };
}
export interface Citation { documentId: string; documentTitle: string; authority: string; sourceUrl?: string | null; effectiveDate?: string | null; excerpt: string; section?: string | null }
export interface Finding { code: string; title: string; explanation: string; severity: string; conclusion: string; confidence: string; verificationRequired: boolean; requiredDocuments: string[]; citations: Citation[]; ruleIds: string[]; estimatedDurationDays?: {minimum: number; maximum: number; basis: string} | null }
export interface GisFinding { code: string; category: string; severity: string; title: string; value: number | string | boolean | null; unit?: string | null; sourceName: string; sourceDate?: string | null; methodology: string; limitations: string[] }
export interface Evidence { title: string; url: string; retrievedAt: string; supportingText: string }
export interface Scenario { scenario: string; capexEgp: number; annualOpexEgp: number; yearOneSavingsEgp: number; npvEgp: number; irrPct: number | null; simplePaybackYears: number | null; discountedPaybackYears: number | null; monthlyLoanPaymentEgp: number | null; assumptions: Record<string, number | string> }
export interface Result {
  runId: string; assessmentId: string; status: string;
  technical: { recommendedCapacityKw: number; physicalMaximumKw: number; evaluatedCapacitiesKw: number[]; annualGenerationKwh: number; annualLoadKwh: number; selfConsumptionRatio: number; selfSufficiencyRatio: number; annualImportedKwh: number; annualExportedKwh: number; roofAreaRequiredM2: number; bindingConstraints: string[]; objectiveName: string };
  financial: Scenario[];
  risk: { runCount: number; seed: number; paybackP10Years: number | null; paybackP50Years: number | null; paybackP90Years: number | null; probabilityTargetPaybackPct: number | null; npvP10Egp: number; npvP50Egp: number; npvP90Egp: number; topSensitivityDrivers: {variable: string; influence: number}[] };
  gisFindings: GisFinding[]; regulatoryFindings: Finding[];
  vendors: {name: string; websiteUrl: string; fitExplanation: string; services: string[]; contactEmail?: string | null; contactPhone?: string | null; evidence: Evidence[]; verificationStatus: string}[];
  warnings: string[]; versions: Record<string, string>;
}
export interface Assumptions { assumptionSet: {id: string; version: string; effectiveDate: string}; values: Record<string, {value: string | number; unit?: string | null; classification: string; source?: string | null; notes?: string | null}> }
export interface AssessmentResponse {
  input: AssessmentInput; result: Result; generatedAt: string; reasons: string[]; runLlm: boolean;
  monthlyEnergy: {month: string; load: number; pv: number; selfConsumed: number}[];
  dailyEnergy: {hour: string; load: number; pv: number}[];
  candidates: {capacity_kw: number; npv_egp: number; self_consumption_ratio: number}[];
  loadModel: {modelVersion: string; archetypeId: string; confidence: string; reconciliationErrorPct: number; warnings: string[]};
  assumptions: Assumptions; regulatoryExplanation: string | null; vendorWarnings: string[];
  financingOptions: {bankName: string; productName: string; financingRatePct: number; termYears: number; evidence: Evidence[]}[];
  financingWarnings: string[]; reportHtml: string;
}
export interface Metadata {coverageNotice: string; regulatoryAiAvailable: boolean; discoveryAvailable: boolean}
