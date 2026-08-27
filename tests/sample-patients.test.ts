import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeSamplePatientRow } from '../lib/samplePatients';

test('normalizeSamplePatientRow converts Supabase row shape to dashboard shape', () => {
  const row = {
    id: 'p-123',
    name: 'Jane Doe',
    age: 52,
    disease_summary: 'Stage II breast cancer',
    condition: 'Breast Cancer',
    assigned_trials: [
      { trialId: 'NCT0001', trialName: 'Trial One', matchScore: 91, status: 'screening' },
    ],
  };

  assert.deepEqual(normalizeSamplePatientRow(row), {
    id: 'p-123',
    name: 'Jane Doe',
    age: 52,
    diseaseSummary: 'Stage II breast cancer',
    condition: 'Breast Cancer',
    assignedTrials: [{ trialId: 'NCT0001', trialName: 'Trial One', matchScore: 91, status: 'screening' }],
  });
});
