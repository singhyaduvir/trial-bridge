import type { Patient } from '@/lib/mock/types';
import { mockPatients } from '@/lib/mock/patient';
import { supabaseAdmin } from '@/lib/supabase/admin';

export function normalizeSamplePatientRow(row: any): Patient {
  const assignedTrials = Array.isArray(row?.assigned_trials)
    ? row.assigned_trials.map((trial: any) => ({
        trialId: String(trial?.trialId ?? trial?.trial_id ?? ''),
        trialName: String(trial?.trialName ?? trial?.trial_name ?? 'Untitled trial'),
        matchScore: Number(trial?.matchScore ?? trial?.match_score ?? 0),
        status: (trial?.status ?? 'pending') as Patient['assignedTrials'][number]['status'],
      }))
    : Array.isArray(row?.assignedTrials)
      ? row.assignedTrials.map((trial: any) => ({
          trialId: String(trial?.trialId ?? ''),
          trialName: String(trial?.trialName ?? 'Untitled trial'),
          matchScore: Number(trial?.matchScore ?? 0),
          status: (trial?.status ?? 'pending') as Patient['assignedTrials'][number]['status'],
        }))
      : [];

  return {
    id: String(row?.id ?? ''),
    name: String(row?.name ?? 'Unknown patient'),
    age: Number(row?.age ?? 0),
    diseaseSummary: String(row?.disease_summary ?? row?.diseaseSummary ?? ''),
    condition: String(row?.condition ?? ''),
    assignedTrials,
  };
}

export async function getSamplePatients(): Promise<Patient[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sample_patients')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('sample_patients table unavailable; using mock patients instead.', error.message);
      return mockPatients;
    }

    if (!data || data.length === 0) {
      return mockPatients;
    }

    return data.map(normalizeSamplePatientRow);
  } catch (error: any) {
    console.warn('Failed to query sample patients from Supabase; using mock patients instead.', error?.message ?? error);
    return mockPatients;
  }
}
