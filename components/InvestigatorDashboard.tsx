'use client';

import React, { useState, useEffect } from 'react';
import { useTrials } from '@/hooks/useTrials';
import { TransformedTrial } from '@/lib/trialTransformers';

type StudyStatus = 'recruitment' | 'phase-i' | 'phase-ii' | 'phase-iii' | 'analysis' | 'completed';

type Participant = {
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

type Study = {
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

const MOCK_STUDIES: Study[] = [
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

const STATUS_LABELS: Record<StudyStatus, string> = {
  'recruitment': 'Recruitment Phase',
  'phase-i': 'Phase I',
  'phase-ii': 'Phase II',
  'phase-iii': 'Phase III',
  'analysis': 'Analysis Phase',
  'completed': 'Completed'
};

const STATUS_COLORS: Record<StudyStatus, string> = {
  'recruitment': 'bg-blue-100 text-blue-700',
  'phase-i': 'bg-purple-100 text-purple-700',
  'phase-ii': 'bg-indigo-100 text-indigo-700',
  'phase-iii': 'bg-green-100 text-green-700',
  'analysis': 'bg-yellow-100 text-yellow-700',
  'completed': 'bg-gray-100 text-gray-700'
};

const PARTICIPANT_STATUS_COLORS: Record<Participant['status'], string> = {
  'screening': 'bg-yellow-100 text-yellow-700',
  'enrolled': 'bg-blue-100 text-blue-700',
  'active': 'bg-green-100 text-green-700',
  'completed': 'bg-gray-100 text-gray-700',
  'withdrawn': 'bg-red-100 text-red-700'
};

// Helper function to map API status to StudyStatus
function mapStatusToStudyStatus(enrollmentStatus: string, phase: string): StudyStatus {
  const statusUpper = enrollmentStatus.toUpperCase();
  if (statusUpper.includes('RECRUITING') || statusUpper.includes('NOT_YET_RECRUITING')) return 'recruitment';
  if (phase.includes('Phase I') || phase.includes('PHASE1')) return 'phase-i';
  if (phase.includes('Phase II') || phase.includes('PHASE2')) return 'phase-ii';
  if (phase.includes('Phase III') || phase.includes('PHASE3')) return 'phase-iii';
  if (statusUpper.includes('COMPLETED')) return 'completed';
  if (statusUpper.includes('ACTIVE') && !statusUpper.includes('RECRUITING')) return 'analysis';
  return 'recruitment';
}

export default function InvestigatorDashboard() {
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedStudy, setEditedStudy] = useState<Study | null>(null);

  // Fetch studies from API
  const { trials: apiTrials, loading, error } = useTrials({
    status: 'RECRUITING', // You can filter by your investigator's studies
  });

  // Transform API trials to Study format, merging with mock participants
  const transformedStudies: Study[] = apiTrials.map(trial => {
    // Find matching mock study for participants data (in real app, this would come from your database)
    const mockStudy = MOCK_STUDIES.find(m => m.id === trial.id);
    
    // Split eligibility criteria into inclusion/exclusion
    const midPoint = Math.ceil(trial.eligibilityCriteria.length / 2);
    const inclusionCriteria = trial.eligibilityCriteria.slice(0, midPoint);
    const exclusionCriteria = trial.eligibilityCriteria.slice(midPoint);

    return {
      id: trial.id,
      title: trial.title,
      condition: trial.condition,
      phase: trial.phase,
      status: mapStatusToStudyStatus(trial.enrollmentStatus, trial.phase),
      sponsor: trial.sponsor,
      location: trial.location,
      description: trial.description,
      eligibilityCriteria: trial.eligibilityCriteria,
      duration: trial.duration,
      enrollmentTarget: mockStudy?.enrollmentTarget || 100, // Default if not in mock data
      currentEnrollment: mockStudy?.currentEnrollment || 0, // Would come from your database
      startDate: mockStudy?.startDate || '2024-01-01', // Would parse from API
      expectedEndDate: mockStudy?.expectedEndDate || '2026-01-01', // Would calculate from API
      participants: mockStudy?.participants || [], // Would come from your database
      protocolDetails: trial.description, // Use description as protocol details
      inclusionCriteria: mockStudy?.inclusionCriteria || inclusionCriteria,
      exclusionCriteria: mockStudy?.exclusionCriteria || exclusionCriteria,
      primaryEndpoints: mockStudy?.primaryEndpoints || [],
      secondaryEndpoints: mockStudy?.secondaryEndpoints || [],
      adverseEvents: mockStudy?.adverseEvents || 0,
      seriousAdverseEvents: mockStudy?.seriousAdverseEvents || 0,
    };
  });

  // Use transformed studies or fallback to mock if API fails
  const studies = transformedStudies.length > 0 ? transformedStudies : MOCK_STUDIES;

  // Set first study as selected when data loads
  useEffect(() => {
    if (studies.length > 0 && !selectedStudyId) {
      setSelectedStudyId(studies[0].id);
    }
  }, [studies.length, selectedStudyId]);

  const selectedStudy = selectedStudyId 
    ? (isEditMode && editedStudy ? editedStudy : studies.find(s => s.id === selectedStudyId))
    : null;

  const incomingApplications = selectedStudy?.participants.filter(p => p.status === 'screening') || [];

  const handleStudySelect = (studyId: string) => {
    setSelectedStudyId(studyId);
    setExpandedParticipantId(null);
    setIsEditMode(false);
    setEditedStudy(null);
  };

  const handleParticipantClick = (participantId: string) => {
    setExpandedParticipantId(expandedParticipantId === participantId ? null : participantId);
  };

  const handleEditTrial = () => {
    if (selectedStudy) {
      setEditedStudy({ ...selectedStudy });
      setIsEditMode(true);
    }
  };

  const handleSaveTrial = () => {
    // In a real app, this would save to the backend
    setIsEditMode(false);
    setEditedStudy(null);
    alert('Trial information updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedStudy(null);
  };

  // Show loading state
  if (loading && transformedStudies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading studies...</p>
        </div>
      </div>
    );
  }

  // Show error state (but still use mock data as fallback)
  if (error && transformedStudies.length === 0) {
    console.warn('Error loading studies from API, using mock data:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investigator Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {studies.length} studies under your management
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Study List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Your Studies</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {studies.map((study) => {
                  const isSelected = selectedStudyId === study.id;
                  const enrollmentPercentage = Math.round((study.currentEnrollment / study.enrollmentTarget) * 100);
                  
                  return (
                    <button
                      key={study.id}
                      onClick={() => handleStudySelect(study.id)}
                      className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[study.status]}`}>
                          {STATUS_LABELS[study.status]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {study.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{study.condition}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{study.phase}</span>
                        <span>•</span>
                        <span>{study.currentEnrollment}/{study.enrollmentTarget} enrolled</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${enrollmentPercentage}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Section - Study Details */}
          <div className="flex-1">
            {selectedStudy ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Study Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[selectedStudy.status]}`}>
                          {STATUS_LABELS[selectedStudy.status]}
                        </span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {selectedStudy.phase}
                        </span>
                        <span className="text-sm text-gray-600">
                          {selectedStudy.currentEnrollment}/{selectedStudy.enrollmentTarget} participants
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedStudy.title}
                      </h2>
                      <p className="text-gray-600 mb-2">{selectedStudy.condition}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📍 {selectedStudy.location}
                        </span>
                        <span>•</span>
                        <span>Sponsor: {selectedStudy.sponsor}</span>
                      </div>
                    </div>
                    <button
                      onClick={isEditMode ? handleSaveTrial : handleEditTrial}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isEditMode
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isEditMode ? 'Save Changes' : 'Edit This Trial'}
                    </button>
                    {isEditMode && (
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Study ID:</span>
                    <span className="font-medium text-gray-900">{selectedStudy.id}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium text-gray-900">{selectedStudy.startDate}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Expected End:</span>
                    <span className="font-medium text-gray-900">{selectedStudy.expectedEndDate}</span>
                  </div>
                </div>

                {/* Study Content */}
                <div className="p-6">
                  {isEditMode && editedStudy ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Study Description</label>
                        <textarea
                          value={editedStudy.description}
                          onChange={(e) => setEditedStudy({ ...editedStudy, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Protocol Details</label>
                        <textarea
                          value={editedStudy.protocolDetails}
                          onChange={(e) => setEditedStudy({ ...editedStudy, protocolDetails: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Duration</label>
                        <input
                          type="text"
                          value={editedStudy.duration}
                          onChange={(e) => setEditedStudy({ ...editedStudy, duration: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Description</h3>
                        <p className="text-gray-700 leading-relaxed">{selectedStudy.description}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Protocol Details</h3>
                        <p className="text-gray-700 leading-relaxed">{selectedStudy.protocolDetails}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Inclusion Criteria</h4>
                            <ul className="space-y-2">
                              {selectedStudy.inclusionCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Exclusion Criteria</h4>
                            <ul className="space-y-2">
                              {selectedStudy.exclusionCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-red-600 font-bold mt-0.5">✗</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Endpoints</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Endpoints</h4>
                            <ul className="space-y-1">
                              {selectedStudy.primaryEndpoints.map((endpoint, idx) => (
                                <li key={idx} className="text-sm text-gray-700">• {endpoint}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Secondary Endpoints</h4>
                            <ul className="space-y-1">
                              {selectedStudy.secondaryEndpoints.map((endpoint, idx) => (
                                <li key={idx} className="text-sm text-gray-700">• {endpoint}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety Data</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Adverse Events</p>
                            <p className="text-2xl font-bold text-gray-900">{selectedStudy.adverseEvents}</p>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Serious Adverse Events</p>
                            <p className="text-2xl font-bold text-red-700">{selectedStudy.seriousAdverseEvents}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Participants ({selectedStudy.participants.length})</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedStudy.participants.map((participant) => (
                                <tr key={participant.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{participant.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{participant.age}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>
                                      {participant.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{participant.enrollmentDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Select a study to view details</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Participants */}
          <div className="w-80 flex-shrink-0">
            {selectedStudy ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Participants</h3>
                </div>
                
                {/* Action Buttons */}
                <div className="p-4 border-b border-gray-200 space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Incoming Applications ({incomingApplications.length})
                  </button>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Contact All
                  </button>
                </div>

                {/* Participants List */}
                <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                  {selectedStudy.participants.map((participant) => {
                    const isExpanded = expandedParticipantId === participant.id;
                    
                    return (
                      <div key={participant.id} className="border-b border-gray-200">
                        <button
                          onClick={() => handleParticipantClick(participant.id)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            isExpanded ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                {participant.name}
                              </h4>
                              <p className="text-xs text-gray-600">Age {participant.age}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>
                              {participant.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Enrolled: {participant.enrollmentDate}</span>
                          </div>
                          <svg
                            className={`w-4 h-4 text-gray-400 mt-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Participant Details Dropdown */}
                        {isExpanded && (
                          <div className="bg-gray-50 p-4 space-y-4">
                            {/* Patient Profile */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-900 mb-2">Patient Profile</h5>
                              <div className="space-y-2 text-xs text-gray-700">
                                <p><span className="font-medium">Condition:</span> {participant.patientProfile.condition}</p>
                                <p><span className="font-medium">Diagnosis:</span> {participant.patientProfile.diagnosis}</p>
                                <p><span className="font-medium">Medical History:</span> {participant.patientProfile.medicalHistory}</p>
                                <p><span className="font-medium">Current Medications:</span> {participant.patientProfile.currentMedications}</p>
                                <p><span className="font-medium">Lab Results:</span> {participant.patientProfile.labResults}</p>
                              </div>
                            </div>
                            
                            {/* Status */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-900 mb-2">Status</h5>
                              <div className="space-y-1 text-xs text-gray-700">
                                <p><span className="font-medium">Current Status:</span> <span className={`px-2 py-0.5 rounded ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>{participant.status}</span></p>
                                <p><span className="font-medium">Enrollment Date:</span> {participant.enrollmentDate}</p>
                              </div>
                            </div>
                            
                            {/* Contact */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-900 mb-2">Contact</h5>
                              <div className="space-y-1 text-xs text-gray-700">
                                <p><span className="font-medium">Email:</span> {participant.contactEmail}</p>
                                <p><span className="font-medium">Phone:</span> {participant.contactPhone}</p>
                                <div className="flex gap-2 mt-2">
                                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors">
                                    Email
                                  </button>
                                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors">
                                    Call
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">Select a study to view participants</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}