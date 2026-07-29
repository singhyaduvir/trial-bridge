'use client';

import { useState } from 'react';
import { useTrials } from '@/hooks/useTrials';
import type { Study, StudyStatus } from '@/lib/mock/types';
import { mockStudies } from '@/lib/mock/studies';
import { STATUS_COLORS, STATUS_LABELS, PARTICIPANT_STATUS_COLORS } from '@/lib/mock/studies';

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
    const mockStudy = mockStudies.find(study => study.id === trial.id);
    
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
  const studies = transformedStudies.length > 0 ? transformedStudies : mockStudies;

  const effectiveStudyId = selectedStudyId ?? studies[0]?.id ?? null;

  const selectedStudy = effectiveStudyId
    ? (isEditMode && editedStudy ? editedStudy : studies.find(s => s.id === effectiveStudyId))
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
      <div className="min-h-screen bg-gemini-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gemini-accent mx-auto"></div>
          <p className="mt-4 text-gemini-muted">Loading studies...</p>
        </div>
      </div>
    );
  }

  // Show error state (but still use mock data as fallback)
  if (error && transformedStudies.length === 0) {
    console.warn('Error loading studies from API, using mock data:', error);
  }

  return (
    <div className="min-h-screen bg-gemini-canvas">
      {/* Header */}
      <div className="bg-gemini-surface border-b border-gemini-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gemini-primary">Investigator Dashboard</h1>
              <p className="text-sm text-gemini-muted mt-1">
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
            <div className="bg-gemini-surface gemini-card overflow-hidden sticky top-24">
              <div className="p-4 bg-gemini-canvas border-b border-gemini-border">
                <h2 className="text-sm font-semibold text-gemini-primary">Your Studies</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {studies.map((study) => {
                  const isSelected = selectedStudyId === study.id;
                  const enrollmentPercentage = Math.round((study.currentEnrollment / study.enrollmentTarget) * 100);
                  
                  return (
                    <button
                      key={study.id}
                      onClick={() => handleStudySelect(study.id)}
                      className={`w-full p-4 text-left border-b border-gemini-border hover:bg-gemini-surface-hover transition-colors duration-200 ${
                        isSelected ? 'bg-gemini-accent-subtle border-l-4 border-l-gemini-accent' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[study.status]}`}>
                          {STATUS_LABELS[study.status]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-gemini-primary mb-1 line-clamp-2">
                        {study.title}
                      </h3>
                      <p className="text-xs text-gemini-muted mb-2">{study.condition}</p>
                      <div className="flex items-center gap-2 text-xs text-gemini-muted mb-2">
                        <span>{study.phase}</span>
                        <span>•</span>
                        <span>{study.currentEnrollment}/{study.enrollmentTarget} enrolled</span>
                      </div>
                      <div className="w-full bg-gemini-surface-hover rounded-full h-1.5">
                        <div 
                          className="bg-gemini-surface h-1.5 rounded-full transition-all"
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
              <div className="bg-gemini-surface rounded-2xl">
                {/* Study Header */}
                <div className="p-6 border-b border-gemini-border">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[selectedStudy.status]}`}>
                          {STATUS_LABELS[selectedStudy.status]}
                        </span>
                        <span className="text-sm gemini-badge gemini-badge-info px-3 py-1 rounded-full font-medium">
                          {selectedStudy.phase}
                        </span>
                        <span className="text-sm text-gemini-muted">
                          {selectedStudy.currentEnrollment}/{selectedStudy.enrollmentTarget} participants
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gemini-primary mb-2">
                        {selectedStudy.title}
                      </h2>
                      <p className="text-gemini-muted mb-2">{selectedStudy.condition}</p>
                      <div className="flex items-center gap-4 text-sm text-gemini-muted">
                        <span className="flex items-center gap-1">
                          📍 {selectedStudy.location}
                        </span>
                        <span>•</span>
                        <span>Sponsor: {selectedStudy.sponsor}</span>
                      </div>
                    </div>
                    <button
                      onClick={isEditMode ? handleSaveTrial : handleEditTrial}
                      className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                        isEditMode
                          ? 'gemini-btn'
                          : 'gemini-btn hover:bg-gemini-surface-hover transition-colors duration-200'
                      }`}
                    >
                      {isEditMode ? 'Save Changes' : 'Edit This Trial'}
                    </button>
                    {isEditMode && (
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gemini-border rounded-xl text-gemini-primary font-medium hover:bg-gemini-surface-hover transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gemini-muted">Study ID:</span>
                    <span className="font-medium text-gemini-primary">{selectedStudy.id}</span>
                    <span className="text-gemini-muted">•</span>
                    <span className="text-gemini-muted">Start Date:</span>
                    <span className="font-medium text-gemini-primary">{selectedStudy.startDate}</span>
                    <span className="text-gemini-muted">•</span>
                    <span className="text-gemini-muted">Expected End:</span>
                    <span className="font-medium text-gemini-primary">{selectedStudy.expectedEndDate}</span>
                  </div>
                </div>

                {/* Study Content */}
                <div className="p-6">
                  {isEditMode && editedStudy ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gemini-primary mb-2">Study Description</label>
                        <textarea
                          value={editedStudy.description}
                          onChange={(e) => setEditedStudy({ ...editedStudy, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gemini-border rounded-xl focus:ring-2 focus:ring-gemini-accent focus:border-transparent"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gemini-primary mb-2">Protocol Details</label>
                        <textarea
                          value={editedStudy.protocolDetails}
                          onChange={(e) => setEditedStudy({ ...editedStudy, protocolDetails: e.target.value })}
                          className="w-full px-4 py-2 border border-gemini-border rounded-xl focus:ring-2 focus:ring-gemini-accent focus:border-transparent"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gemini-primary mb-2">Duration</label>
                        <input
                          type="text"
                          value={editedStudy.duration}
                          onChange={(e) => setEditedStudy({ ...editedStudy, duration: e.target.value })}
                          className="w-full px-4 py-2 border border-gemini-border rounded-xl focus:ring-2 focus:ring-gemini-accent focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Study Description</h3>
                        <p className="text-gemini-primary leading-relaxed">{selectedStudy.description}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Protocol Details</h3>
                        <p className="text-gemini-primary leading-relaxed">{selectedStudy.protocolDetails}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Eligibility Criteria</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gemini-primary mb-2">Inclusion Criteria</h4>
                            <ul className="space-y-2">
                              {selectedStudy.inclusionCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gemini-primary">
                                  <span className="text-gemini-success-text font-bold mt-0.5">✓</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gemini-primary mb-2">Exclusion Criteria</h4>
                            <ul className="space-y-2">
                              {selectedStudy.exclusionCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gemini-primary">
                                  <span className="text-gemini-error-text font-bold mt-0.5">✗</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Study Endpoints</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gemini-primary mb-2">Primary Endpoints</h4>
                            <ul className="space-y-1">
                              {selectedStudy.primaryEndpoints.map((endpoint, idx) => (
                                <li key={idx} className="text-sm text-gemini-primary">• {endpoint}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gemini-primary mb-2">Secondary Endpoints</h4>
                            <ul className="space-y-1">
                              {selectedStudy.secondaryEndpoints.map((endpoint, idx) => (
                                <li key={idx} className="text-sm text-gemini-primary">• {endpoint}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Safety Data</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gemini-surface rounded-2xl">
                            <p className="text-sm text-gemini-muted mb-1">Adverse Events</p>
                            <p className="text-2xl font-bold text-gemini-primary">{selectedStudy.adverseEvents}</p>
                          </div>
                          <div className="p-4 bg-gemini-error-bg rounded-2xl">
                            <p className="text-sm text-gemini-muted mb-1">Serious Adverse Events</p>
                            <p className="text-2xl font-bold text-gemini-error-text">{selectedStudy.seriousAdverseEvents}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Participants ({selectedStudy.participants.length})</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gemini-border">
                            <thead className="bg-gemini-canvas">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gemini-muted uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gemini-muted uppercase">Age</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gemini-muted uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gemini-muted uppercase">Enrollment Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gemini-border">
                              {selectedStudy.participants.map((participant) => (
                                <tr key={participant.id} className="hover:bg-gemini-surface-hover transition-colors duration-200">
                                  <td className="px-4 py-3 text-sm text-gemini-primary">{participant.name}</td>
                                  <td className="px-4 py-3 text-sm text-gemini-muted">{participant.age}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>
                                      {participant.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gemini-muted">{participant.enrollmentDate}</td>
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
              <div className="bg-gemini-surface rounded-2xl p-12 text-center">
                <p className="text-gemini-muted">Select a study to view details</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Participants */}
          <div className="w-80 flex-shrink-0">
            {selectedStudy ? (
              <div className="bg-gemini-surface rounded-2xl sticky top-24">
                <div className="p-4 border-b border-gemini-border">
                  <h3 className="text-sm font-semibold text-gemini-primary">Participants</h3>
                </div>
                
                {/* Action Buttons */}
                <div className="p-4 border-b border-gemini-border space-y-2">
                  <button className="w-full bg-gemini-surface hover:bg-gemini-surface-hover transition-colors duration-200 text-gemini-primary font-medium py-2 px-4 rounded-2xl transition-colors">
                    Incoming Applications ({incomingApplications.length})
                  </button>
                  <button className="w-full gemini-btn font-medium py-2 px-4 rounded-2xl transition-colors">
                    Contact All
                  </button>
                </div>

                {/* Participants List */}
                <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                  {selectedStudy.participants.map((participant) => {
                    const isExpanded = expandedParticipantId === participant.id;
                    
                    return (
                      <div key={participant.id} className="border-b border-gemini-border">
                        <button
                          onClick={() => handleParticipantClick(participant.id)}
                          className={`w-full p-4 text-left hover:bg-gemini-surface-hover transition-colors duration-200 ${
                            isExpanded ? 'bg-gemini-accent-subtle' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gemini-primary mb-1">
                                {participant.name}
                              </h4>
                              <p className="text-xs text-gemini-muted">Age {participant.age}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>
                              {participant.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gemini-muted">
                            <span>Enrolled: {participant.enrollmentDate}</span>
                          </div>
                          <svg
                            className={`w-4 h-4 text-gemini-muted mt-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Participant Details Dropdown */}
                        {isExpanded && (
                          <div className="bg-gemini-canvas p-4 space-y-4">
                            {/* Patient Profile */}
                            <div>
                              <h5 className="text-xs font-semibold text-gemini-primary mb-2">Patient Profile</h5>
                              <div className="space-y-2 text-xs text-gemini-primary">
                                <p><span className="font-medium">Condition:</span> {participant.patientProfile.condition}</p>
                                <p><span className="font-medium">Diagnosis:</span> {participant.patientProfile.diagnosis}</p>
                                <p><span className="font-medium">Medical History:</span> {participant.patientProfile.medicalHistory}</p>
                                <p><span className="font-medium">Current Medications:</span> {participant.patientProfile.currentMedications}</p>
                                <p><span className="font-medium">Lab Results:</span> {participant.patientProfile.labResults}</p>
                              </div>
                            </div>
                            
                            {/* Status */}
                            <div>
                              <h5 className="text-xs font-semibold text-gemini-primary mb-2">Status</h5>
                              <div className="space-y-1 text-xs text-gemini-primary">
                                <p><span className="font-medium">Current Status:</span> <span className={`px-2 py-0.5 rounded ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>{participant.status}</span></p>
                                <p><span className="font-medium">Enrollment Date:</span> {participant.enrollmentDate}</p>
                              </div>
                            </div>
                            
                            {/* Contact */}
                            <div>
                              <h5 className="text-xs font-semibold text-gemini-primary mb-2">Contact</h5>
                              <div className="space-y-1 text-xs text-gemini-primary">
                                <p><span className="font-medium">Email:</span> {participant.contactEmail}</p>
                                <p><span className="font-medium">Phone:</span> {participant.contactPhone}</p>
                                <div className="flex gap-2 mt-2">
                                  <button className="flex-1 bg-gemini-surface hover:bg-gemini-surface-hover transition-colors duration-200 text-gemini-primary text-xs font-medium py-2 px-3 rounded transition-colors">
                                    Email
                                  </button>
                                  <button className="flex-1 gemini-btn text-xs font-medium py-2 px-3 rounded transition-colors">
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
              <div className="bg-gemini-surface rounded-2xl p-8 text-center">
                <p className="text-gemini-muted text-sm">Select a study to view participants</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}