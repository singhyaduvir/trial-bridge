'use client';

import { useState, useEffect, useMemo } from 'react';
import { formDataToProfile, profileToSearchParams } from '@/lib/eligibility/profileFromForm';
import { loadEligibilityFormData } from '@/lib/eligibility/storage';
import type { EligibilityFormData, PatientEligibilityProfile } from '@/lib/eligibility/types';
import { matchTrialsToPatient, type MatchedTrial } from '@/lib/matching/matchTrials';

export function useMatchedTrials() {
  const [formData, setFormData] = useState<EligibilityFormData | null>(null);
  const [profile, setProfile] = useState<PatientEligibilityProfile | null>(null);
  const [matchedTrials, setMatchedTrials] = useState<MatchedTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const stored = loadEligibilityFormData();
    setFormData(stored);
    setProfile(stored ? formDataToProfile(stored) : null);
    setProfileLoaded(true);
  }, []);

  const searchParams = useMemo(
    () => (profile ? profileToSearchParams(profile) : {}),
    [profile],
  );

  useEffect(() => {
    if (!profileLoaded) return;

    if (!profile || !profile.diagnosis.diagnosis) {
      setLoading(false);
      setMatchedTrials([]);
      return;
    }

    async function fetchAndMatch() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (searchParams.condition) queryParams.append('condition', searchParams.condition);
        if (searchParams.location) queryParams.append('location', searchParams.location);
        queryParams.append('status', 'RECRUITING');
        queryParams.append('pageSize', '50');

        const response = await fetch(`/api/trials?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trials');
        }

        const data = await response.json();
        const matched = matchTrialsToPatient(data.trials, profile!);
        setMatchedTrials(matched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMatchedTrials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAndMatch();
  }, [profile, profileLoaded, searchParams.condition, searchParams.location]);

  return {
    formData,
    profile,
    matchedTrials,
    loading: loading || !profileLoaded,
    error,
    hasProfile: Boolean(profile?.diagnosis.diagnosis),
  };
}
