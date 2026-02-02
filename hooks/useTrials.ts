// hooks/useTrials.ts

import { useState, useEffect } from 'react';
import { TransformedTrial } from '@/lib/trialTransformers';

export function useTrials(params?: {
  condition?: string;
  location?: string;
  status?: string;
  phase?: string;
}) {
  const [trials, setTrials] = useState<TransformedTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrials() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (params?.condition) queryParams.append('condition', params.condition);
        if (params?.location) queryParams.append('location', params.location);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.phase) queryParams.append('phase', params.phase);

        const response = await fetch(`/api/trials?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trials');
        }
        
        const data = await response.json();
        setTrials(data.trials);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setTrials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTrials();
  }, [params?.condition, params?.location, params?.status, params?.phase]);

  return { trials, loading, error };
}