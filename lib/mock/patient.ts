import type { Patient } from './types';

// Mock patients - in real app, this would come from your database
export const mockPatients: Patient[] = [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      age: 58,
      diseaseSummary: 'Stage III NSCLC, EGFR mutation positive, ECOG 1, no prior systemic therapy',
      condition: 'Non-Small Cell Lung Cancer (NSCLC)',
      assignedTrials: [
        { trialId: 'NCT05234567', trialName: 'Phase III Study of Novel Immunotherapy for Advanced NSCLC', matchScore: 95, status: 'screening' },
        { trialId: 'NCT05234568', trialName: 'Targeted Therapy Trial for EGFR-Positive Lung Cancer', matchScore: 92, status: 'pending' }
      ]
    },
    {
      id: 'P002',
      name: 'Michael Chen',
      age: 64,
      diseaseSummary: 'Metastatic melanoma, BRAF wild-type, ECOG 0, treatment-naïve',
      condition: 'Metastatic Melanoma',
      assignedTrials: [
        { trialId: 'NCT05234569', trialName: 'Immunotherapy Combination Study for Metastatic Melanoma', matchScore: 88, status: 'enrolled' }
      ]
    },
    {
      id: 'P003',
      name: 'Emily Rodriguez',
      age: 45,
      diseaseSummary: 'Stage IV breast cancer, HER2+, prior adjuvant therapy completed 6 months ago',
      condition: 'Breast Cancer',
      assignedTrials: [
        { trialId: 'NCT05234570', trialName: 'HER2-Targeted Therapy for Advanced Breast Cancer', matchScore: 85, status: 'pending' }
      ]
    }
  ];