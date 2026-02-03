'use client';

import React, { useState } from 'react';
import { useTrials } from '@/hooks/useTrials';
import { TransformedTrial } from '@/lib/trialTransformers';

export default function TrialMatchingPage() {
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [savedTrials, setSavedTrials] = useState<Set<string>>(new Set());
  const [appliedTrials, setAppliedTrials] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'eligibility' | 'details'>('overview');

  // Fetch trials from API
  const { trials, loading, error } = useTrials({
    status: 'RECRUITING', // Only show actively recruiting trials
  });

  // Use real data or fallback to empty array
  const MOCK_TRIALS = trials.length > 0 ? trials : []; // You can keep mock data as fallback

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <p className="text-gray-600 mt-2">Using mock data as fallback</p>
        </div>
      </div>
    );
  }

  if (MOCK_TRIALS.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No trials found</p>
      </div>
    );
  }

  const currentTrial = MOCK_TRIALS[currentTrialIndex];

  const handleSave = (trialId: string) => {
    setSavedTrials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trialId)) {
        newSet.delete(trialId);
      } else {
        newSet.add(trialId);
      }
      return newSet;
    });
  };

  const handleApply = (trialId: string) => {
    setAppliedTrials(prev => new Set([...prev, trialId]));
    alert('Application submitted! The study coordinator will contact you within 2-3 business days.');
  };

  const handleNext = () => {
    if (currentTrialIndex < MOCK_TRIALS.length - 1) {
      setCurrentTrialIndex(currentTrialIndex + 1);
      setSelectedTab('overview');
    }
  };

  const handlePrevious = () => {
    if (currentTrialIndex > 0) {
      setCurrentTrialIndex(currentTrialIndex - 1);
      setSelectedTab('overview');
    }
  };

  const hasApplied = appliedTrials.has(currentTrial.id);
  const isSaved = savedTrials.has(currentTrial.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Clinical Trial Matches</h1>
              <p className="text-sm text-gray-600 mt-1">
                {MOCK_TRIALS.length} trials match your profile
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View Saved ({savedTrials.size})
              </button>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Applications ({appliedTrials.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Trial List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Matching Trials</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {MOCK_TRIALS.map((trial, index) => (
                  <button
                    key={trial.id}
                    onClick={() => {
                      setCurrentTrialIndex(index);
                      setSelectedTab('overview');
                    }}
                    className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      currentTrialIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        (trial.matchScore ?? 0) >= 90 ? 'bg-green-100 text-green-700' :
                        (trial.matchScore ?? 0) >= 75 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trial.matchScore ?? 'N/A'}% Match
                      </span>
                      {appliedTrials.has(trial.id) && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                          Applied
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {trial.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{trial.condition}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{trial.phase}</span>
                      <span>•</span>
                      <span>{trial.distance || 'Distance not available'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Trial Details */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Trial Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        (currentTrial.matchScore ?? 0) >= 90 ? 'bg-green-100 text-green-700' :
                        (currentTrial.matchScore ?? 0) >= 75 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {currentTrial.matchScore ?? 'N/A'}% Match
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {currentTrial.phase}
                      </span>
                      <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        {currentTrial.enrollmentStatus}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentTrial.title}
                    </h2>
                    <p className="text-gray-600 mb-2">{currentTrial.condition}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📍 {currentTrial.location}
                      </span>
                      <span>•</span>
                      <span>{currentTrial.distance || 'Distance not available'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(currentTrial.id)}
                      className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                        isSaved
                          ? 'border-blue-600 text-blue-600 bg-blue-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Sponsor:</span>
                  <span className="font-medium text-gray-900">{currentTrial.sponsor}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">Study ID:</span>
                  <span className="font-medium text-gray-900">{currentTrial.id}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-orange-600 font-medium">
                    {currentTrial.spotsRemaining} spots remaining
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-8 px-6">
                  <button
                    onClick={() => setSelectedTab('overview')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setSelectedTab('eligibility')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === 'eligibility'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Eligibility
                  </button>
                  <button
                    onClick={() => setSelectedTab('details')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === 'details'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Study Details
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Description</h3>
                      <p className="text-gray-700 leading-relaxed">{currentTrial.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Study Duration</p>
                          <p className="font-semibold text-gray-900">{currentTrial.duration}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Compensation</p>
                          <p className="font-semibold text-gray-900">{currentTrial.compensation}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Required</h3>
                      <ul className="space-y-2">
                        {currentTrial.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTab === 'eligibility' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Based on your profile, you meet the key eligibility requirements for this trial
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {currentTrial.eligibilityCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span className="text-gray-700">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-medium mb-2">Important Note</p>
                      <p className="text-sm text-blue-800">
                        Final eligibility will be determined during the screening process. Additional testing and medical record review may be required.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                      <ol className="space-y-3">
                        {currentTrial.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Study Coordinator Email</p>
                        <p className="font-medium text-blue-600">{currentTrial.contactEmail}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-900 font-medium mb-2">Before You Apply</p>
                      <p className="text-sm text-amber-800">
                        We recommend discussing this trial with your primary care physician or oncologist. They can help you understand if this trial is appropriate for your specific situation.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={currentTrialIndex === 0}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous Trial
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentTrialIndex === MOCK_TRIALS.length - 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Trial →
                    </button>
                  </div>
                  <button
                    onClick={() => handleApply(currentTrial.id)}
                    disabled={hasApplied}
                    className={`px-8 py-3 rounded-md font-semibold transition-colors ${
                      hasApplied
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasApplied ? 'Application Submitted' : 'Apply to This Trial'}
                  </button>
                </div>
              </div>
            </div>

            {/* Trial Counter */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Trial {currentTrialIndex + 1} of {MOCK_TRIALS.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}