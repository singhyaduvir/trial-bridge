'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMatchedTrials } from '@/hooks/useMatchedTrials';

export default function TrialsMatchView() {
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [savedTrials, setSavedTrials] = useState<Set<string>>(new Set());
  const [appliedTrials, setAppliedTrials] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'eligibility' | 'details'>('overview');

  const { profile, matchedTrials, loading, error, hasProfile } = useMatchedTrials();

  if (loading) {
    return (
      <div className="min-h-screen bg-gemini-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gemini-accent mx-auto" />
          <p className="mt-4 text-gemini-muted">Finding trials that match your profile…</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gemini-canvas flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gemini-primary mb-2">Complete your eligibility profile</h1>
          <p className="text-gemini-muted mb-6">
            We need your health information to find clinical trials you may qualify for.
          </p>
          <Link
            href="/eligibility"
            className="inline-block px-6 py-3 gemini-btn rounded-xl font-medium hover:bg-gemini-surface-hover transition-colors duration-200"
          >
            Start eligibility screening
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gemini-canvas flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-gemini-error-text font-medium">Error: {error}</p>
          <p className="text-gemini-muted mt-2 mb-6">We could not load trials. Try again or update your profile.</p>
          <Link
            href="/eligibility"
            className="inline-block px-6 py-3 gemini-btn rounded-xl font-medium hover:bg-gemini-surface-hover transition-colors duration-200"
          >
            Edit eligibility profile
          </Link>
        </div>
      </div>
    );
  }

  if (matchedTrials.length === 0) {
    return (
      <div className="min-h-screen bg-gemini-canvas">
        <ProfileHeader
          diagnosis={profile?.diagnosis.diagnosis}
          matchCount={0}
        />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-gemini-primary mb-2">No matching trials found</h2>
          <p className="text-gemini-muted mb-6">
            Based on your eligibility profile, we did not find recruiting trials that meet your criteria.
            Try broadening your diagnosis or location, or check back as new trials are added.
          </p>
          <Link
            href="/eligibility"
            className="inline-block px-6 py-3 gemini-btn rounded-xl font-medium hover:bg-gemini-surface-hover transition-colors duration-200"
          >
            Edit eligibility profile
          </Link>
        </div>
      </div>
    );
  }

  const currentTrial = matchedTrials[currentTrialIndex];
  const hasApplied = appliedTrials.has(currentTrial.id);
  const isSaved = savedTrials.has(currentTrial.id);

  const handleSave = (trialId: string) => {
    setSavedTrials((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trialId)) newSet.delete(trialId);
      else newSet.add(trialId);
      return newSet;
    });
  };

  const handleApply = (trialId: string) => {
    setAppliedTrials((prev) => new Set([...prev, trialId]));
    alert('Application submitted! The study coordinator will contact you within 2-3 business days.');
  };

  const handleNext = () => {
    if (currentTrialIndex < matchedTrials.length - 1) {
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

  return (
    <div className="min-h-screen bg-gemini-canvas">
      <ProfileHeader
        diagnosis={profile?.diagnosis.diagnosis}
        matchCount={matchedTrials.length}
        savedCount={savedTrials.size}
        appliedCount={appliedTrials.size}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <div className="w-80 flex-shrink-0">
            <div className="bg-gemini-surface gemini-card overflow-hidden sticky top-24">
              <div className="p-4 bg-gemini-canvas border-b border-gemini-border">
                <h2 className="text-sm font-semibold text-gemini-primary">Matching Trials</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {matchedTrials.map((trial, index) => (
                  <button
                    key={trial.id}
                    type="button"
                    onClick={() => {
                      setCurrentTrialIndex(index);
                      setSelectedTab('overview');
                    }}
                    className={`w-full p-4 text-left border-b border-gemini-border hover:bg-gemini-surface-hover transition-colors duration-200 ${
                      currentTrialIndex === index ? 'bg-gemini-accent-subtle border-l-4 border-l-gemini-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          trial.matchScore >= 90
                            ? 'gemini-badge gemini-badge-success'
                            : trial.matchScore >= 75
                              ? 'gemini-badge gemini-badge-info'
                              : 'gemini-badge gemini-badge-neutral'
                        }`}
                      >
                        {trial.matchScore}% Match
                      </span>
                      {appliedTrials.has(trial.id) && (
                        <span className="text-xs gemini-badge gemini-badge-info px-2 py-1 rounded font-medium">
                          Applied
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gemini-primary mb-1 line-clamp-2">{trial.title}</h3>
                    <p className="text-xs text-gemini-muted mb-2">{trial.condition}</p>
                    <div className="flex items-center gap-2 text-xs text-gemini-muted">
                      <span>{trial.phase}</span>
                      <span>•</span>
                      <span className="line-clamp-1">{trial.location}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-gemini-surface rounded-2xl">
              <div className="p-6 border-b border-gemini-border">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          currentTrial.matchScore >= 90
                            ? 'gemini-badge gemini-badge-success'
                            : currentTrial.matchScore >= 75
                              ? 'gemini-badge gemini-badge-info'
                              : 'gemini-badge gemini-badge-neutral'
                        }`}
                      >
                        {currentTrial.matchScore}% Match
                      </span>
                      <span className="text-sm gemini-badge gemini-badge-info px-3 py-1 rounded-full font-medium">
                        {currentTrial.phase}
                      </span>
                      <span className="text-sm gemini-badge gemini-badge-success px-3 py-1 rounded-full font-medium">
                        {currentTrial.enrollmentStatus}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gemini-primary mb-2">{currentTrial.title}</h2>
                    <p className="text-gemini-muted mb-2">{currentTrial.condition}</p>
                    <div className="flex items-center gap-4 text-sm text-gemini-muted">
                      <span>📍 {currentTrial.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(currentTrial.id)}
                      className={`px-4 py-2 border rounded-xl font-medium transition-colors ${
                        isSaved
                          ? 'border-gemini-accent text-gemini-accent bg-gemini-accent-subtle'
                          : 'border-gemini-border text-gemini-primary hover:bg-gemini-surface-hover transition-colors duration-200'
                      }`}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gemini-muted">Sponsor:</span>
                  <span className="font-medium text-gemini-primary">{currentTrial.sponsor}</span>
                  <span className="text-gemini-muted">•</span>
                  <span className="text-gemini-muted">Study ID:</span>
                  <span className="font-medium text-gemini-primary">{currentTrial.id}</span>
                </div>
              </div>

              <div className="border-b border-gemini-border">
                <div className="flex gap-8 px-6">
                  {(['overview', 'eligibility', 'details'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedTab(tab)}
                      className={`py-4 border-b-2 font-medium text-sm transition-colors capitalize ${
                        selectedTab === tab
                          ? 'border-gemini-accent text-gemini-accent'
                          : 'border-transparent text-gemini-muted hover:text-gemini-primary'
                      }`}
                    >
                      {tab === 'details' ? 'Study Details' : tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Study Description</h3>
                      <p className="text-gemini-primary leading-relaxed">{currentTrial.description}</p>
                    </div>

                    {currentTrial.matchReasons && currentTrial.matchReasons.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gemini-primary mb-3">Why you match</h3>
                        <ul className="space-y-2">
                          {currentTrial.matchReasons.map((reason) => (
                            <li key={reason} className="flex items-start gap-2 text-gemini-primary">
                              <span className="text-gemini-success-text mt-0.5">✓</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentTrial.warnings && currentTrial.warnings.length > 0 && (
                      <div className="bg-gemini-warning-bg border border-gemini-border rounded-2xl p-4">
                        {currentTrial.warnings.map((warning) => (
                          <p key={warning} className="text-sm text-gemini-warning-text">
                            {warning}
                          </p>
                        ))}
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Key Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gemini-surface rounded-2xl">
                          <p className="text-sm text-gemini-muted mb-1">Study Duration</p>
                          <p className="font-semibold text-gemini-primary">{currentTrial.duration}</p>
                        </div>
                        {currentTrial.compensation && (
                          <div className="p-4 bg-gemini-surface rounded-2xl">
                            <p className="text-sm text-gemini-muted mb-1">Compensation</p>
                            <p className="font-semibold text-gemini-primary">{currentTrial.compensation}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">What&apos;s Required</h3>
                      <ul className="space-y-2">
                        {currentTrial.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gemini-accent mt-1">•</span>
                            <span className="text-gemini-primary">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTab === 'eligibility' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Your match summary</h3>
                      <div className="bg-gemini-success-bg border border-gemini-border rounded-2xl p-4 mb-4">
                        <p className="text-sm text-gemini-success-text font-medium">
                          This trial passed our eligibility screening based on your profile (age, sex, diagnosis,
                          labs, and other criteria). Final eligibility is confirmed by the study team.
                        </p>
                      </div>
                      {currentTrial.matchReasons && currentTrial.matchReasons.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {currentTrial.matchReasons.map((reason) => (
                            <li
                              key={reason}
                              className="flex items-start gap-3 p-3 bg-gemini-success-bg rounded-2xl border border-gemini-border"
                            >
                              <span className="text-gemini-success-text font-bold mt-0.5">✓</span>
                              <span className="text-gemini-primary">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Trial eligibility criteria</h3>
                      <ul className="space-y-3">
                        {currentTrial.eligibilityCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-gemini-surface rounded-2xl">
                            <span className="text-gemini-muted font-bold mt-0.5">•</span>
                            <span className="text-gemini-primary">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gemini-accent-subtle border border-gemini-border rounded-2xl p-4">
                      <p className="text-sm text-gemini-info-text font-medium mb-2">Important Note</p>
                      <p className="text-sm text-gemini-info-text">
                        Final eligibility will be determined during the screening process. Additional testing and
                        medical record review may be required.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Next Steps</h3>
                      <ol className="space-y-3">
                        {currentTrial.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 gemini-btn rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-gemini-primary pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gemini-primary mb-3">Contact Information</h3>
                      <div className="p-4 bg-gemini-surface rounded-2xl">
                        <p className="text-sm text-gemini-muted mb-2">Study Coordinator Email</p>
                        <p className="font-medium text-gemini-accent">{currentTrial.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gemini-canvas border-t border-gemini-border">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentTrialIndex === 0}
                      className="px-4 py-2 border border-gemini-border rounded-xl text-gemini-primary font-medium hover:bg-gemini-surface-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous Trial
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentTrialIndex === matchedTrials.length - 1}
                      className="px-4 py-2 border border-gemini-border rounded-xl text-gemini-primary font-medium hover:bg-gemini-surface-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Trial →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApply(currentTrial.id)}
                    disabled={hasApplied}
                    className={`px-8 py-3 rounded-xl font-semibold transition-colors ${
                      hasApplied
                        ? 'bg-gemini-surface-hover text-gemini-muted cursor-not-allowed'
                        : 'gemini-btn hover:bg-gemini-surface-hover transition-colors duration-200'
                    }`}
                  >
                    {hasApplied ? 'Application Submitted' : 'Apply to This Trial'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gemini-muted">
              Trial {currentTrialIndex + 1} of {matchedTrials.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileHeader({
  diagnosis,
  matchCount,
  savedCount = 0,
  appliedCount = 0,
}: {
  diagnosis?: string;
  matchCount: number;
  savedCount?: number;
  appliedCount?: number;
}) {
  return (
    <div className="bg-gemini-surface border-b border-gemini-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gemini-primary">Your Clinical Trial Matches</h1>
            <p className="text-sm text-gemini-muted mt-1">
              {matchCount} {matchCount === 1 ? 'trial' : 'trials'} match your profile
              {diagnosis ? ` for ${diagnosis}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gemini-muted">Saved ({savedCount})</span>
            <span className="text-sm text-gemini-muted">Applications ({appliedCount})</span>
            <Link
              href="/eligibility"
              className="px-4 py-2 border border-gemini-accent text-gemini-accent rounded-xl font-medium hover:bg-gemini-accent-subtle"
            >
              Edit eligibility profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
