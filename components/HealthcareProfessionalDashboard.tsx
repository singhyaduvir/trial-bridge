// components/HealthcareProfessionalDashboard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTrialById } from '@/hooks/useTrialById';
import type { Patient } from '@/lib/mock/types';

export default function HealthcareProfessionalDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/sample-patients');
        if (!res.ok) return;
        const data: Patient[] = await res.json();
        if (!mounted) return;
        setPatients(data);
        if (!selectedPatientId && data.length > 0) {
          setSelectedPatientId(data[0].id);
          setExpandedPatientId(data[0].id);
          setSelectedTrialId(data[0].assignedTrials?.[0]?.trialId ?? null);
        }
      } catch (err) {
        console.error('Failed to load sample patients', err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  
  // Fetch trial details when a trial is selected
  const { trial: selectedTrial, loading: trialLoading } = useTrialById(selectedTrialId);

  const patientTrialMatch = selectedPatient?.assignedTrials.find(t => t.trialId === selectedTrialId);

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
    // Select first trial if available
    const patient = patients.find((p) => p.id === patientId);
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
    <div className="min-h-screen bg-gemini-canvas">
      {/* Header */}
      <div className="bg-gemini-surface border-b border-gemini-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gemini-primary">Patient Dashboard</h1>
              <p className="text-sm text-gemini-muted mt-1">
                {patients.length} patients under your care
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Patient List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gemini-surface gemini-card overflow-hidden sticky top-24">
              <div className="p-4 bg-gemini-canvas border-b border-gemini-border">
                <h2 className="text-sm font-semibold text-gemini-primary">Your Patients</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {patients.map((patient) => {
                  const isExpanded = expandedPatientId === patient.id;
                  const isSelected = selectedPatientId === patient.id;
                  
                  return (
                    <div key={patient.id}>
                      <button
                        onClick={() => handlePatientClick(patient.id)}
                        className={`w-full p-4 text-left border-b border-gemini-border hover:bg-gemini-surface-hover transition-colors duration-200 ${
                          isSelected ? 'bg-gemini-accent-subtle border-l-4 border-l-gemini-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gemini-primary mb-1">
                              {patient.name}
                            </h3>
                            <p className="text-xs text-gemini-muted mb-2">Age {patient.age} • {patient.condition}</p>
                            <p className="text-xs text-gemini-muted line-clamp-2">
                              {patient.diseaseSummary}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gemini-muted">
                            {patient.assignedTrials.length} trial{patient.assignedTrials.length !== 1 ? 's' : ''}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gemini-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                        <div className="bg-gemini-canvas border-b border-gemini-border">
                          {patient.assignedTrials.map((trialAssignment) => {
                            const isTrialSelected = selectedTrialId === trialAssignment.trialId;
                            return (
                              <button
                                key={trialAssignment.trialId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTrialSelect(trialAssignment.trialId);
                                }}
                                className={`w-full p-3 pl-8 text-left hover:bg-gemini-surface-hover transition-colors duration-200 ${
                                  isTrialSelected ? 'bg-gemini-accent-subtle border-l-2 border-l-gemini-accent' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                    trialAssignment.matchScore >= 90 ? 'gemini-badge gemini-badge-success' :
                                    trialAssignment.matchScore >= 75 ? 'gemini-badge gemini-badge-info' :
                                    'gemini-badge gemini-badge-neutral'
                                  }`}>
                                    {trialAssignment.matchScore}% Match
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                    trialAssignment.status === 'enrolled' ? 'gemini-badge gemini-badge-info' :
                                    trialAssignment.status === 'screening' ? 'gemini-badge gemini-badge-warning' :
                                    'gemini-badge gemini-badge-neutral'
                                  }`}>
                                    {trialAssignment.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gemini-primary line-clamp-2">
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
              <div className="bg-gemini-surface rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gemini-accent mx-auto"></div>
                <p className="mt-4 text-gemini-muted">Loading trial details...</p>
              </div>
            ) : selectedTrial && selectedPatient && patientTrialMatch ? (
              <div className="bg-gemini-surface rounded-2xl">
                {/* Trial Header */}
                <div className="p-6 border-b border-gemini-border">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          patientTrialMatch.matchScore >= 90 ? 'gemini-badge gemini-badge-success' :
                          patientTrialMatch.matchScore >= 75 ? 'gemini-badge gemini-badge-info' :
                          'gemini-badge gemini-badge-neutral'
                        }`}>
                          {patientTrialMatch.matchScore}% Match
                        </span>
                        <span className="text-sm gemini-badge gemini-badge-info px-3 py-1 rounded-full font-medium">
                          {selectedTrial.phase}
                        </span>
                        <span className="text-sm gemini-badge gemini-badge-success px-3 py-1 rounded-full font-medium">
                          {selectedTrial.enrollmentStatus}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          patientTrialMatch.status === 'enrolled' ? 'gemini-badge gemini-badge-info' :
                          patientTrialMatch.status === 'screening' ? 'gemini-badge gemini-badge-warning' :
                          'gemini-badge gemini-badge-neutral'
                        }`}>
                          {patientTrialMatch.status}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gemini-primary mb-2">
                        {selectedTrial.title}
                      </h2>
                      <p className="text-gemini-muted mb-2">{selectedTrial.condition}</p>
                      <div className="flex items-center gap-4 text-sm text-gemini-muted">
                        <span className="flex items-center gap-1">
                          📍 {selectedTrial.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gemini-muted">Patient:</span>
                    <span className="font-medium text-gemini-primary">{selectedPatient.name}</span>
                    <span className="text-gemini-muted">•</span>
                    <span className="text-gemini-muted">Sponsor:</span>
                    <span className="font-medium text-gemini-primary">{selectedTrial.sponsor}</span>
                    <span className="text-gemini-muted">•</span>
                    <span className="text-gemini-muted">Study ID:</span>
                    <span className="font-medium text-gemini-primary">{selectedTrial.id}</span>
                  </div>
                </div>

                {/* Trial Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Study Description</h3>
                      <p className="text-gemini-primary leading-relaxed">{selectedTrial.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Eligibility Criteria</h3>
                      <ul className="space-y-3">
                        {selectedTrial.eligibilityCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-gemini-surface rounded-2xl">
                            <span className="text-gemini-success-text font-bold mt-0.5">✓</span>
                            <span className="text-gemini-primary">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Key Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gemini-surface rounded-2xl">
                          <p className="text-sm text-gemini-muted mb-1">Study Duration</p>
                          <p className="font-semibold text-gemini-primary">{selectedTrial.duration}</p>
                        </div>
                        <div className="p-4 bg-gemini-surface rounded-2xl">
                          <p className="text-sm text-gemini-muted mb-1">Match Score</p>
                          <p className="font-semibold text-gemini-primary">{patientTrialMatch.matchScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gemini-surface rounded-2xl p-12 text-center">
                <p className="text-gemini-muted">Select a patient and trial to view details</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Message Patient */}
          <div className="w-80 flex-shrink-0">
            {selectedPatient ? (
              <div className="gemini-card sticky top-24 overflow-hidden">
                <div className="gemini-card-header">
                  <h3 className="text-sm font-semibold text-gemini-primary">Patient: {selectedPatient.name}</h3>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="gemini-btn w-full"
                  >
                    Message Patient
                  </button>
                </div>
                
                {/* Chat Box */}
                {isChatOpen && (
                  <div className="border-t border-gemini-border">
                    <div className="gemini-card-header">
                      <h4 className="text-sm font-semibold text-gemini-primary">Chat with {selectedPatient.name}</h4>
                    </div>
                    <div className="h-96 flex flex-col bg-gemini-canvas">
                      {/* Chat Messages Area */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="flex justify-end">
                          <div className="gemini-chat-bubble gemini-chat-bubble-user">
                            <p className="text-sm">Hello, how are you feeling today?</p>
                            <p className="text-xs text-gemini-muted mt-1">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="gemini-chat-bubble gemini-chat-bubble-assistant">
                            <p className="text-sm">I&apos;m doing well, thank you for checking in.</p>
                            <p className="text-xs text-gemini-muted mt-1">10:32 AM</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chat Input */}
                      <div className="p-4 border-t border-gemini-border">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            className="gemini-input gemini-input-pill flex-1"
                          />
                          <button className="gemini-btn gemini-input-pill px-5">
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="gemini-card p-8 text-center">
                <p className="text-gemini-muted text-sm">Select a patient to message</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}