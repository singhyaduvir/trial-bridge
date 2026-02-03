// components/HealthcareProfessionalDashboard.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useTrials } from '@/hooks/useTrials';
import { useTrialById } from '@/hooks/useTrialById';
import { TransformedTrial } from '@/lib/trialTransformers';

type Patient = {
  id: string;
  name: string;
  age: number;
  diseaseSummary: string;
  condition: string;
  assignedTrials: TrialAssignment[];
};

type TrialAssignment = {
  trialId: string;
  trialName: string;
  matchScore: number;
  status: 'pending' | 'enrolled' | 'screening';
};

// Mock patients - in real app, this would come from your database
const MOCK_PATIENTS: Patient[] = [
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

export default function HealthcareProfessionalDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(MOCK_PATIENTS[0]?.id || null);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(MOCK_PATIENTS[0]?.id || null);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
  
  // Fetch trial details when a trial is selected
  const { trial: selectedTrial, loading: trialLoading } = useTrialById(selectedTrialId);
  
  // Set initial trial when patient is selected
  React.useEffect(() => {
    if (selectedPatient && selectedPatient.assignedTrials.length > 0 && !selectedTrialId) {
      setSelectedTrialId(selectedPatient.assignedTrials[0].trialId);
    }
  }, [selectedPatient, selectedTrialId]);

  const patientTrialMatch = selectedPatient?.assignedTrials.find(t => t.trialId === selectedTrialId);

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
    // Select first trial if available
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    if (patient && patient.assignedTrials.length > 0) {
      setSelectedTrialId(patient.assignedTrials[0].trialId);
    } else {
      setSelectedTrialId(null);
    }
  };

  const handleTrialSelect = (trialId: string) => {
    setSelectedTrialId(trialId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {MOCK_PATIENTS.length} patients under your care
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Patient List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Your Patients</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {MOCK_PATIENTS.map((patient) => {
                  const isExpanded = expandedPatientId === patient.id;
                  const isSelected = selectedPatientId === patient.id;
                  
                  return (
                    <div key={patient.id}>
                      <button
                        onClick={() => handlePatientClick(patient.id)}
                        className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-900 mb-1">
                              {patient.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">Age {patient.age} • {patient.condition}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {patient.diseaseSummary}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {patient.assignedTrials.length} trial{patient.assignedTrials.length !== 1 ? 's' : ''}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {/* Trial Subdropdown */}
                      {isExpanded && patient.assignedTrials.length > 0 && (
                        <div className="bg-gray-50 border-b border-gray-200">
                          {patient.assignedTrials.map((trialAssignment) => {
                            const isTrialSelected = selectedTrialId === trialAssignment.trialId;
                            return (
                              <button
                                key={trialAssignment.trialId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTrialSelect(trialAssignment.trialId);
                                }}
                                className={`w-full p-3 pl-8 text-left hover:bg-gray-100 transition-colors ${
                                  isTrialSelected ? 'bg-blue-100 border-l-2 border-l-blue-600' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                    trialAssignment.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                                    trialAssignment.matchScore >= 75 ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {trialAssignment.matchScore}% Match
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                    trialAssignment.status === 'enrolled' ? 'bg-purple-100 text-purple-700' :
                                    trialAssignment.status === 'screening' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {trialAssignment.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2">
                                  {trialAssignment.trialName}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Middle Section - Trial Details */}
          <div className="flex-1">
            {trialLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading trial details...</p>
              </div>
            ) : selectedTrial && selectedPatient && patientTrialMatch ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Trial Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          patientTrialMatch.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                          patientTrialMatch.matchScore >= 75 ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {patientTrialMatch.matchScore}% Match
                        </span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {selectedTrial.phase}
                        </span>
                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          {selectedTrial.enrollmentStatus}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          patientTrialMatch.status === 'enrolled' ? 'bg-purple-100 text-purple-700' :
                          patientTrialMatch.status === 'screening' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {patientTrialMatch.status}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedTrial.title}
                      </h2>
                      <p className="text-gray-600 mb-2">{selectedTrial.condition}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📍 {selectedTrial.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium text-gray-900">{selectedPatient.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Sponsor:</span>
                    <span className="font-medium text-gray-900">{selectedTrial.sponsor}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Study ID:</span>
                    <span className="font-medium text-gray-900">{selectedTrial.id}</span>
                  </div>
                </div>

                {/* Trial Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedTrial.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
                      <ul className="space-y-3">
                        {selectedTrial.eligibilityCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span className="text-gray-700">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Study Duration</p>
                          <p className="font-semibold text-gray-900">{selectedTrial.duration}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Match Score</p>
                          <p className="font-semibold text-gray-900">{patientTrialMatch.matchScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Select a patient and trial to view details</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Message Patient */}
          <div className="w-80 flex-shrink-0">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Patient: {selectedPatient.name}</h3>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
                  >
                    Message Patient
                  </button>
                </div>
                
                {/* Chat Box */}
                {isChatOpen && (
                  <div className="border-t border-gray-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900">Chat with {selectedPatient.name}</h4>
                    </div>
                    <div className="h-96 flex flex-col">
                      {/* Chat Messages Area */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">Hello, how are you feeling today?</p>
                            <p className="text-xs text-blue-200 mt-1">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-200 text-gray-900 rounded-lg p-3 max-w-xs">
                            <p className="text-sm">I'm doing well, thank you for checking in.</p>
                            <p className="text-xs text-gray-500 mt-1">10:32 AM</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chat Input */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">Select a patient to message</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}