/** ClinicalTrials.gov returns healthyVolunteers as boolean or occasionally string */
export function acceptsHealthyVolunteers(value: unknown): boolean {
  if (value === true) return true;
  if (value === false || value == null) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'yes';
  }
  return false;
}

export function parseTrialAge(ageStr?: string): number | null {
  if (!ageStr || /^(n\/a|na)$/i.test(ageStr.trim())) return null;
  const match = ageStr.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function patientSexToApi(sexAtBirth?: string): 'MALE' | 'FEMALE' | null {
  if (sexAtBirth === 'Male') return 'MALE';
  if (sexAtBirth === 'Female') return 'FEMALE';
  return null;
}

export function parsePatientEcog(ecogScore?: string): number | null {
  if (!ecogScore) return null;
  const match = ecogScore.match(/^(\d)/);
  return match ? Number(match[1]) : null;
}

export function parseMaxEcogFromCriteria(text: string): number | null {
  const normalized = text.replace(/\s+/g, ' ');
  const patterns = [
    /ECOG\s*(?:performance\s*status|PS)?\s*(?:of\s*)?0\s*[-–to]+\s*(\d)/i,
    /ECOG\s*(?:performance\s*status|PS)?\s*(?:≤|<=|=<)\s*(\d)/i,
    /ECOG\s*(?:performance\s*status|PS)?\s*(?:must be|of)\s*(\d)/i,
    /ECOG\s*(?:score\s*)?(\d)\s*or\s*less/i,
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#-]+/)
    .filter((token) => token.length >= 3);
}

export function tokenizeBiomarkers(...sources: (string | undefined)[]): string[] {
  const tokens = new Set<string>();
  for (const source of sources) {
    if (!source) continue;
    for (const part of source.split(/[,;/\n]+/)) {
      const cleaned = part.trim().toLowerCase();
      if (cleaned.length >= 2) tokens.add(cleaned);
    }
  }
  return [...tokens];
}

export function locationTokens(location?: string): string[] {
  if (!location) return [];
  return location
    .split(/[,/]/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length >= 2);
}

export function textMentionsExclusion(text: string, patterns: RegExp[]): boolean {
  const exclusionSection = text.split(/exclusion criteria/i)[1] ?? text;
  const searchText = exclusionSection.toLowerCase();
  return patterns.some((pattern) => pattern.test(searchText));
}

export type LabThreshold = { min?: number; max?: number };

export function parseLabThreshold(text: string, labName: string): LabThreshold | null {
  const regex = new RegExp(
    `${labName}[^\\d]{0,40}(?:≥|>=|>|at least)\\s*(\\d+(?:\\.\\d+)?)|` +
      `${labName}[^\\d]{0,40}(?:≤|<=|<|up to)\\s*(\\d+(?:\\.\\d+)?)`,
    'i',
  );
  const match = text.match(regex);
  if (!match) return null;
  if (match[1]) return { min: Number(match[1]) };
  if (match[2]) return { max: Number(match[2]) };
  return null;
}

export function conditionMatchScore(
  patientDiagnosis: string | undefined,
  trialCondition: string,
  eligibilityText: string,
): number {
  if (!patientDiagnosis) return 0;
  const diagnosisTokens = extractKeywords(patientDiagnosis);
  const haystack = `${trialCondition} ${eligibilityText}`.toLowerCase();
  if (diagnosisTokens.length === 0) return 0;

  let hits = 0;
  for (const token of diagnosisTokens) {
    if (haystack.includes(token)) hits += 1;
  }
  const ratio = hits / diagnosisTokens.length;
  if (ratio >= 0.5) return 25;
  if (ratio >= 0.25) return 15;
  if (hits > 0) return 8;
  return 0;
}
