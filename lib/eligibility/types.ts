export type CategoryId =
  | 'demographics'
  | 'diagnosis'
  | 'treatments'
  | 'laboratory'
  | 'functional'
  | 'genetic'
  | 'reproductive';

export type EligibilityFormData = {
  [key in CategoryId]?: Record<string, string>;
};

export type PatientEligibilityProfile = {
  demographics: {
    age?: number;
    sexAtBirth?: string;
    pregnant?: string;
    breastfeeding?: string;
    location?: string;
  };
  diagnosis: {
    diagnosis?: string;
    biomarkerStatus?: string;
  };
  treatments: {
    otherTrials?: string;
  };
  laboratory: {
    hemoglobin?: number;
    anc?: number;
    platelets?: number;
    bilirubin?: number;
    creatinine?: number;
    egfr?: number;
  };
  functional: {
    ecogScore?: string;
  };
  genetic: {
    mutations?: string;
    diagnosticTest?: string;
  };
  reproductive: {
    pregnancyTest?: string;
  };
};

export type TrialMatchEvaluation = {
  isEligible: boolean;
  matchScore: number;
  matchReasons: string[];
  warnings: string[];
  disqualifiers: string[];
};
