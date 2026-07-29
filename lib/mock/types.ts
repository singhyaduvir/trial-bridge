export type Patient = {
    id: string;
    name: string;
    age: number;
    diseaseSummary: string;
    condition: string;
    assignedTrials: TrialAssignment[];
  };
  
  export type TrialAssignment = {
    trialId: string;
    trialName: string;
    matchScore: number;
    status: 'pending' | 'enrolled' | 'screening';
  };

  export type StudyStatus = 'recruitment' | 'phase-i' | 'phase-ii' | 'phase-iii' | 'analysis' | 'completed';

export type Participant = {
  id: string;
  name: string;
  age: number;
  enrollmentDate: string;
  status: 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn';
  contactEmail: string;
  contactPhone: string;
  patientProfile: {
    condition: string;
    diagnosis: string;
    medicalHistory: string;
    currentMedications: string;
    labResults: string;
  };
};

export type Study = {
  id: string;
  title: string;
  condition: string;
  phase: string;
  status: StudyStatus;
  sponsor: string;
  location: string;
  description: string;
  eligibilityCriteria: string[];
  duration: string;
  enrollmentTarget: number;
  currentEnrollment: number;
  startDate: string;
  expectedEndDate: string;
  participants: Participant[];
  protocolDetails: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  primaryEndpoints: string[];
  secondaryEndpoints: string[];
  adverseEvents: number;
  seriousAdverseEvents: number;
};