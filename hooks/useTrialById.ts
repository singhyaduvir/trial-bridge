// hooks/useTrialById.ts

import { useState, useEffect } from 'react';
import { TransformedTrial } from '@/lib/trialTransformers';

export function useTrialById(nctId: string | null) {
  const [trial, setTrial] = useState<TransformedTrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrial() {
      if (!nctId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/trials/${nctId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trial');
        }
        
        const data = await response.json();
        setTrial(data.trial);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setTrial(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTrial();
  }, [nctId]);

  return { trial, loading, error };
}