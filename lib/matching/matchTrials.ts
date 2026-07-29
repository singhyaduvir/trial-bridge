import type { PatientEligibilityProfile, TrialMatchEvaluation } from '@/lib/eligibility/types';
import type { TransformedTrial } from '@/lib/trialTransformers';
import {
  conditionMatchScore,
  locationTokens,
  parseLabThreshold,
  parseMaxEcogFromCriteria,
  parsePatientEcog,
  acceptsHealthyVolunteers,
  parseTrialAge,
  patientSexToApi,
  textMentionsExclusion,
  tokenizeBiomarkers,
} from './parseCriteria';

export const MIN_MATCH_SCORE = 55;

export type MatchedTrial = TransformedTrial & {
  matchReasons: string[];
  warnings: string[];
};

function getEligibilityText(trial: TransformedTrial): string {
  return trial.eligibilityMeta?.criteriaText ?? trial.eligibilityCriteria.join('\n');
}

function checkAge(
  profile: PatientEligibilityProfile,
  trial: TransformedTrial,
): { pass: boolean; score: number; reason?: string; disqualifier?: string } {
  const age = profile.demographics.age;
  const minAge = parseTrialAge(trial.eligibilityMeta?.minimumAge);
  const maxAge = parseTrialAge(trial.eligibilityMeta?.maximumAge);

  if (age === undefined) {
    return { pass: true, score: 0 };
  }

  if (minAge !== null && age < minAge) {
    return {
      pass: false,
      score: 0,
      disqualifier: `Age ${age} is below trial minimum (${minAge})`,
    };
  }
  if (maxAge !== null && age > maxAge) {
    return {
      pass: false,
      score: 0,
      disqualifier: `Age ${age} exceeds trial maximum (${maxAge})`,
    };
  }

  return {
    pass: true,
    score: 15,
    reason: minAge !== null || maxAge !== null ? `Age ${age} within trial range` : undefined,
  };
}

function checkSex(
  profile: PatientEligibilityProfile,
  trial: TransformedTrial,
): { pass: boolean; score: number; reason?: string; disqualifier?: string } {
  const patientSex = patientSexToApi(profile.demographics.sexAtBirth);
  const trialSex = trial.eligibilityMeta?.sex?.toUpperCase();

  if (!patientSex || !trialSex || trialSex === 'ALL') {
    return { pass: true, score: patientSex && trialSex ? 10 : 0 };
  }

  if (patientSex !== trialSex) {
    return {
      pass: false,
      score: 0,
      disqualifier: `Trial requires ${trialSex.toLowerCase()} participants`,
    };
  }

  return { pass: true, score: 10, reason: 'Sex matches trial requirements' };
}

function checkReproductiveExclusions(
  profile: PatientEligibilityProfile,
  text: string,
): { pass: boolean; disqualifier?: string } {
  const pregnant = profile.demographics.pregnant === 'Yes';
  const breastfeeding = profile.demographics.breastfeeding === 'Yes';
  const pregnancyTestPositive = profile.reproductive.pregnancyTest === 'Positive';

  if (
    pregnant &&
    textMentionsExclusion(text, [/pregnan/, /gestation/, /nursing while pregnant/])
  ) {
    return { pass: false, disqualifier: 'Pregnancy excluded by trial criteria' };
  }

  if (
    breastfeeding &&
    textMentionsExclusion(text, [/breastfeed/, /lactation/, /nursing/])
  ) {
    return { pass: false, disqualifier: 'Breastfeeding excluded by trial criteria' };
  }

  if (
    pregnancyTestPositive &&
    textMentionsExclusion(text, [/pregnan/, /positive pregnancy test/])
  ) {
    return { pass: false, disqualifier: 'Positive pregnancy test excluded by trial' };
  }

  return { pass: true };
}

function checkEcog(
  profile: PatientEligibilityProfile,
  text: string,
): { pass: boolean; score: number; reason?: string; disqualifier?: string } {
  const patientEcog = parsePatientEcog(profile.functional.ecogScore);
  const maxEcog = parseMaxEcogFromCriteria(text);

  if (patientEcog === null) return { pass: true, score: 0 };
  if (maxEcog === null) return { pass: true, score: 5 };

  if (patientEcog > maxEcog) {
    return {
      pass: false,
      score: 0,
      disqualifier: `ECOG ${patientEcog} exceeds trial limit (≤${maxEcog})`,
    };
  }

  return { pass: true, score: 10, reason: `ECOG ${patientEcog} within trial limit` };
}

function checkHealthyVolunteers(
  profile: PatientEligibilityProfile,
  trial: TransformedTrial,
): { pass: boolean; disqualifier?: string } {
  const acceptsHealthy = acceptsHealthyVolunteers(trial.eligibilityMeta?.healthyVolunteers);
  const hasDiagnosis = Boolean(profile.diagnosis.diagnosis);
  if (acceptsHealthy && hasDiagnosis) {
    return { pass: false, disqualifier: 'Trial enrolls healthy volunteers only' };
  }
  return { pass: true };
}

function checkPriorTrialParticipation(
  profile: PatientEligibilityProfile,
  text: string,
): { pass: boolean; disqualifier?: string } {
  if (profile.treatments.otherTrials !== 'Yes') return { pass: true };
  if (textMentionsExclusion(text, [/prior.*clinical trial/, /previous.*trial participation/, /enrolled in another study/])) {
    return { pass: false, disqualifier: 'Recent trial participation may be excluded' };
  }
  return { pass: true };
}

function scoreBiomarkers(profile: PatientEligibilityProfile, text: string): { score: number; reason?: string } {
  const biomarkers = tokenizeBiomarkers(
    profile.diagnosis.biomarkerStatus,
    profile.genetic.mutations,
    profile.genetic.diagnosticTest,
  );
  if (biomarkers.length === 0) return { score: 0 };

  const lowerText = text.toLowerCase();
  const hits = biomarkers.filter((b) => lowerText.includes(b));
  if (hits.length === 0) return { score: 0 };

  const ratio = hits.length / biomarkers.length;
  if (ratio >= 0.5) {
    return { score: 15, reason: `Biomarker alignment: ${hits.slice(0, 3).join(', ')}` };
  }
  return { score: 8, reason: `Partial biomarker alignment: ${hits.join(', ')}` };
}

function scoreLocation(profile: PatientEligibilityProfile, trial: TransformedTrial): { score: number; reason?: string } {
  const tokens = locationTokens(profile.demographics.location);
  if (tokens.length === 0) return { score: 0 };

  const trialLocation = trial.location.toLowerCase();
  const hits = tokens.filter((t) => trialLocation.includes(t));
  if (hits.length > 0) {
    return { score: 15, reason: `Trial location matches ${hits.join(', ')}` };
  }
  return { score: 0 };
}

function scoreLabs(
  profile: PatientEligibilityProfile,
  text: string,
): { score: number; reason?: string; disqualifier?: string } {
  const checks: Array<{ value?: number; name: string; aliases: string[] }> = [
    { value: profile.laboratory.hemoglobin, name: 'hemoglobin', aliases: ['hemoglobin', 'hgb', 'hb'] },
    { value: profile.laboratory.anc, name: 'anc', aliases: ['anc', 'neutrophil'] },
    { value: profile.laboratory.platelets, name: 'platelet', aliases: ['platelet'] },
    { value: profile.laboratory.creatinine, name: 'creatinine', aliases: ['creatinine'] },
    { value: profile.laboratory.bilirubin, name: 'bilirubin', aliases: ['bilirubin'] },
    { value: profile.laboratory.egfr, name: 'egfr', aliases: ['egfr', 'glomerular'] },
  ];

  let score = 0;
  const matched: string[] = [];

  for (const check of checks) {
    if (check.value === undefined) continue;

    for (const alias of check.aliases) {
      const threshold = parseLabThreshold(text, alias);
      if (!threshold) continue;

      if (threshold.min !== undefined && check.value < threshold.min) {
        return {
          score: 0,
          disqualifier: `${check.name} ${check.value} below required minimum (${threshold.min})`,
        };
      }
      if (threshold.max !== undefined && check.value > threshold.max) {
        return {
          score: 0,
          disqualifier: `${check.name} ${check.value} above allowed maximum (${threshold.max})`,
        };
      }
      score += 2;
      matched.push(check.name);
      break;
    }
  }

  if (matched.length > 0) {
    return { score: Math.min(10, score + 4), reason: `Lab values compatible: ${matched.join(', ')}` };
  }
  return { score: 0 };
}

export function evaluateTrialMatch(
  trial: TransformedTrial,
  profile: PatientEligibilityProfile,
): TrialMatchEvaluation {
  const text = getEligibilityText(trial);
  const disqualifiers: string[] = [];
  const matchReasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  const ageCheck = checkAge(profile, trial);
  if (!ageCheck.pass && ageCheck.disqualifier) disqualifiers.push(ageCheck.disqualifier);
  else if (ageCheck.reason) matchReasons.push(ageCheck.reason);
  score += ageCheck.score;

  const sexCheck = checkSex(profile, trial);
  if (!sexCheck.pass && sexCheck.disqualifier) disqualifiers.push(sexCheck.disqualifier);
  else if (sexCheck.reason) matchReasons.push(sexCheck.reason);
  score += sexCheck.score;

  const reproductiveCheck = checkReproductiveExclusions(profile, text);
  if (!reproductiveCheck.pass && reproductiveCheck.disqualifier) {
    disqualifiers.push(reproductiveCheck.disqualifier);
  }

  const ecogCheck = checkEcog(profile, text);
  if (!ecogCheck.pass && ecogCheck.disqualifier) disqualifiers.push(ecogCheck.disqualifier);
  else if (ecogCheck.reason) matchReasons.push(ecogCheck.reason);
  score += ecogCheck.score;

  const healthyCheck = checkHealthyVolunteers(profile, trial);
  if (!healthyCheck.pass && healthyCheck.disqualifier) disqualifiers.push(healthyCheck.disqualifier);

  const priorTrialCheck = checkPriorTrialParticipation(profile, text);
  if (!priorTrialCheck.pass && priorTrialCheck.disqualifier) {
    disqualifiers.push(priorTrialCheck.disqualifier);
  }

  const conditionScore = conditionMatchScore(
    profile.diagnosis.diagnosis,
    trial.condition,
    text,
  );
  score += conditionScore;
  if (conditionScore >= 15) {
    matchReasons.push('Diagnosis aligns with trial condition');
  } else if (conditionScore > 0) {
    matchReasons.push('Partial diagnosis alignment with trial');
  } else if (profile.diagnosis.diagnosis) {
    warnings.push('Diagnosis may not closely match this trial — confirm with coordinator');
  }

  const biomarkerScore = scoreBiomarkers(profile, text);
  score += biomarkerScore.score;
  if (biomarkerScore.reason) matchReasons.push(biomarkerScore.reason);

  const locationScore = scoreLocation(profile, trial);
  score += locationScore.score;
  if (locationScore.reason) matchReasons.push(locationScore.reason);

  const labScore = scoreLabs(profile, text);
  if (labScore.disqualifier) disqualifiers.push(labScore.disqualifier);
  else {
    score += labScore.score;
    if (labScore.reason) matchReasons.push(labScore.reason);
  }

  const isEligible = disqualifiers.length === 0 && conditionScore > 0;
  const matchScore = Math.min(100, Math.round(score));

  return {
    isEligible,
    matchScore,
    matchReasons,
    warnings,
    disqualifiers,
  };
}

export function matchTrialsToPatient(
  trials: TransformedTrial[],
  profile: PatientEligibilityProfile,
): MatchedTrial[] {
  const results: MatchedTrial[] = [];

  for (const trial of trials) {
    const evaluation = evaluateTrialMatch(trial, profile);
    if (evaluation.isEligible && evaluation.matchScore >= MIN_MATCH_SCORE) {
      results.push({
        ...trial,
        matchScore: evaluation.matchScore,
        matchReasons: evaluation.matchReasons,
        warnings: evaluation.warnings,
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
