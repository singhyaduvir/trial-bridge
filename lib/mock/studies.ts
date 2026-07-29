import type { Participant, Study, StudyStatus } from './types';

export const mockStudies: Study[] = [
    {
      id: 'NCT05234567',
      title: 'Phase III Study of Novel Immunotherapy for Advanced Non-Small Cell Lung Cancer',
      condition: 'Non-Small Cell Lung Cancer (NSCLC)',
      phase: 'Phase III',
      status: 'phase-iii',
      sponsor: 'Oncology Research Institute',
      location: 'Massachusetts General Hospital, Boston, MA',
      description: 'This study evaluates the effectiveness of a novel immunotherapy drug in combination with standard chemotherapy for patients with advanced non-small cell lung cancer who have not received prior systemic therapy.',
      eligibilityCriteria: [
        'Age 18-75 years',
        'Confirmed diagnosis of Stage III/IV NSCLC',
        'ECOG performance status 0-1',
        'No prior systemic therapy for advanced disease',
        'Adequate organ function (specific lab values required)'
      ],
      duration: '18-24 months',
      enrollmentTarget: 150,
      currentEnrollment: 87,
      startDate: '2024-01-15',
      expectedEndDate: '2026-01-15',
      protocolDetails: 'Randomized, double-blind, placebo-controlled study. Patients will receive either the investigational drug plus standard chemotherapy or placebo plus standard chemotherapy. Treatment cycles are 21 days. Primary assessment at 6 months.',
      inclusionCriteria: [
        'Histologically confirmed Stage IIIB/IV NSCLC',
        'ECOG performance status 0-1',
        'Adequate hematologic and organ function',
        'Life expectancy ≥ 12 weeks'
      ],
      exclusionCriteria: [
        'Prior systemic therapy for advanced disease',
        'Active autoimmune disease',
        'Uncontrolled intercurrent illness',
        'Pregnancy or breastfeeding'
      ],
      primaryEndpoints: [
        'Overall Survival (OS)',
        'Progression-Free Survival (PFS)'
      ],
      secondaryEndpoints: [
        'Objective Response Rate (ORR)',
        'Duration of Response (DOR)',
        'Safety and Tolerability'
      ],
      adverseEvents: 23,
      seriousAdverseEvents: 3,
      participants: [
        {
          id: 'P001',
          name: 'Sarah Johnson',
          age: 58,
          enrollmentDate: '2024-02-10',
          status: 'active',
          contactEmail: 'sarah.johnson@email.com',
          contactPhone: '(555) 123-4567',
          patientProfile: {
            condition: 'Non-Small Cell Lung Cancer (NSCLC)',
            diagnosis: 'Stage IIIB NSCLC, EGFR mutation positive',
            medicalHistory: 'Hypertension, well-controlled. No prior cancer history.',
            currentMedications: 'Lisinopril 10mg daily, Aspirin 81mg daily',
            labResults: 'Hemoglobin: 12.5 g/dL, ANC: 1800, Platelets: 250,000'
          }
        },
        {
          id: 'P002',
          name: 'Robert Martinez',
          age: 64,
          enrollmentDate: '2024-02-15',
          status: 'active',
          contactEmail: 'robert.martinez@email.com',
          contactPhone: '(555) 234-5678',
          patientProfile: {
            condition: 'Non-Small Cell Lung Cancer (NSCLC)',
            diagnosis: 'Stage IV NSCLC, no driver mutations',
            medicalHistory: 'Former smoker, quit 5 years ago. Type 2 diabetes, well-controlled.',
            currentMedications: 'Metformin 1000mg BID, Atorvastatin 20mg daily',
            labResults: 'Hemoglobin: 11.8 g/dL, ANC: 2100, Platelets: 280,000'
          }
        },
        {
          id: 'P003',
          name: 'Linda Chen',
          age: 52,
          enrollmentDate: '2024-01-20',
          status: 'screening',
          contactEmail: 'linda.chen@email.com',
          contactPhone: '(555) 345-6789',
          patientProfile: {
            condition: 'Non-Small Cell Lung Cancer (NSCLC)',
            diagnosis: 'Stage IIIA NSCLC, pending molecular testing',
            medicalHistory: 'No significant comorbidities',
            currentMedications: 'None',
            labResults: 'Hemoglobin: 13.2 g/dL, ANC: 3200, Platelets: 310,000'
          }
        },
        {
          id: 'P004',
          name: 'James Wilson',
          age: 71,
          enrollmentDate: '2023-12-05',
          status: 'completed',
          contactEmail: 'james.wilson@email.com',
          contactPhone: '(555) 456-7890',
          patientProfile: {
            condition: 'Non-Small Cell Lung Cancer (NSCLC)',
            diagnosis: 'Stage IV NSCLC, completed 18-month protocol',
            medicalHistory: 'Mild COPD, well-controlled',
            currentMedications: 'Albuterol PRN, Tiotropium daily',
            labResults: 'Hemoglobin: 12.0 g/dL, ANC: 1900, Platelets: 240,000'
          }
        }
      ]
    },
    {
      id: 'NCT05234568',
      title: 'Targeted Therapy Trial for EGFR-Positive Lung Cancer',
      condition: 'EGFR+ Non-Small Cell Lung Cancer',
      phase: 'Phase II',
      status: 'phase-ii',
      sponsor: 'Dana-Farber Cancer Institute',
      location: 'Dana-Farber Cancer Institute, Boston, MA',
      description: 'A study investigating a next-generation EGFR tyrosine kinase inhibitor in patients with EGFR-mutated non-small cell lung cancer who have progressed on prior EGFR-targeted therapy.',
      eligibilityCriteria: [
        'Age 18+ years',
        'Documented EGFR mutation (exon 19 deletion or L858R)',
        'Disease progression on prior EGFR TKI',
        'Measurable disease per RECIST 1.1',
        'Adequate hematologic and organ function'
      ],
      duration: '12-18 months',
      enrollmentTarget: 80,
      currentEnrollment: 45,
      startDate: '2024-03-01',
      expectedEndDate: '2025-09-01',
      protocolDetails: 'Open-label, single-arm study. Patients receive the investigational EGFR TKI orally daily. Treatment continues until disease progression or unacceptable toxicity. Response assessments every 8 weeks.',
      inclusionCriteria: [
        'Confirmed EGFR mutation (exon 19 del or L858R)',
        'Progression on prior EGFR TKI',
        'ECOG 0-2',
        'Adequate organ function'
      ],
      exclusionCriteria: [
        'Prior treatment with investigational agent',
        'Uncontrolled brain metastases',
        'Active infection',
        'QTc > 470ms'
      ],
      primaryEndpoints: [
        'Objective Response Rate (ORR)'
      ],
      secondaryEndpoints: [
        'Progression-Free Survival (PFS)',
        'Overall Survival (OS)',
        'Safety Profile'
      ],
      adverseEvents: 12,
      seriousAdverseEvents: 1,
      participants: [
        {
          id: 'P005',
          name: 'Maria Garcia',
          age: 59,
          enrollmentDate: '2024-03-10',
          status: 'active',
          contactEmail: 'maria.garcia@email.com',
          contactPhone: '(555) 567-8901',
          patientProfile: {
            condition: 'EGFR+ Non-Small Cell Lung Cancer',
            diagnosis: 'Stage IV NSCLC, EGFR exon 19 deletion',
            medicalHistory: 'Prior treatment with erlotinib, progressed after 14 months',
            currentMedications: 'Investigational drug 150mg daily',
            labResults: 'Hemoglobin: 11.5 g/dL, ANC: 1700, Platelets: 220,000'
          }
        }
      ]
    },
    {
      id: 'NCT05234569',
      title: 'Immunotherapy Combination Study for Metastatic Melanoma',
      condition: 'Metastatic Melanoma',
      phase: 'Phase III',
      status: 'recruitment',
      sponsor: 'National Cancer Institute',
      location: 'Beth Israel Deaconess Medical Center, Boston, MA',
      description: 'Evaluating dual checkpoint inhibitor therapy versus standard single-agent immunotherapy in treatment-naïve patients with metastatic melanoma.',
      eligibilityCriteria: [
        'Age 18+ years',
        'Histologically confirmed metastatic melanoma',
        'No prior systemic therapy for metastatic disease',
        'ECOG performance status 0-2',
        'No active autoimmune disease'
      ],
      duration: '24-36 months',
      enrollmentTarget: 200,
      currentEnrollment: 23,
      startDate: '2024-04-01',
      expectedEndDate: '2027-04-01',
      protocolDetails: 'Randomized, open-label study comparing dual checkpoint inhibition vs single-agent. Patients randomized 1:1. Treatment cycles every 3 weeks. Primary analysis at 24 months.',
      inclusionCriteria: [
        'Metastatic melanoma confirmed by histology',
        'Treatment-naïve for metastatic disease',
        'ECOG 0-2',
        'Measurable disease per RECIST 1.1'
      ],
      exclusionCriteria: [
        'Prior immunotherapy for metastatic disease',
        'Active autoimmune disease',
        'Uncontrolled brain metastases',
        'History of organ transplantation'
      ],
      primaryEndpoints: [
        'Overall Survival (OS)',
        'Progression-Free Survival (PFS)'
      ],
      secondaryEndpoints: [
        'Objective Response Rate (ORR)',
        'Duration of Response',
        'Safety and Tolerability'
      ],
      adverseEvents: 5,
      seriousAdverseEvents: 0,
      participants: [
        {
          id: 'P006',
          name: 'David Thompson',
          age: 48,
          enrollmentDate: '2024-04-15',
          status: 'active',
          contactEmail: 'david.thompson@email.com',
          contactPhone: '(555) 678-9012',
          patientProfile: {
            condition: 'Metastatic Melanoma',
            diagnosis: 'Stage IV melanoma, BRAF wild-type',
            medicalHistory: 'No significant comorbidities',
            currentMedications: 'Investigational combination therapy',
            labResults: 'Hemoglobin: 13.5 g/dL, ANC: 3500, Platelets: 290,000'
          }
        }
      ]
    }
  ];
  
  export const STATUS_LABELS: Record<StudyStatus, string> = {
    'recruitment': 'Recruitment Phase',
    'phase-i': 'Phase I',
    'phase-ii': 'Phase II',
    'phase-iii': 'Phase III',
    'analysis': 'Analysis Phase',
    'completed': 'Completed'
  };
  
  export const STATUS_COLORS: Record<StudyStatus, string> = {
    'recruitment': 'bg-blue-100 text-blue-700',
    'phase-i': 'bg-purple-100 text-purple-700',
    'phase-ii': 'bg-indigo-100 text-indigo-700',
    'phase-iii': 'bg-green-100 text-green-700',
    'analysis': 'bg-yellow-100 text-yellow-700',
    'completed': 'bg-gray-100 text-gray-700'
  };
  
  export const PARTICIPANT_STATUS_COLORS: Record<Participant['status'], string> = {
    'screening': 'bg-yellow-100 text-yellow-700',
    'enrolled': 'bg-blue-100 text-blue-700',
    'active': 'bg-green-100 text-green-700',
    'completed': 'bg-gray-100 text-gray-700',
    'withdrawn': 'bg-red-100 text-red-700'
  };