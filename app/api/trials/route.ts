// app/api/trials/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchTrials } from '@/lib/clinicalTrialsApi';
import { transformClinicalTrialData } from '@/lib/trialTransformers';
import {
  createApiError,
  enforceRateLimit,
  parseOptionalString,
  parsePositiveInt,
  sanitizeError,
} from '@/lib/api/security';

const ALLOWED_STATUSES = new Set(['RECRUITING', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'SUSPENDED']);
const ALLOWED_PHASES = new Set(['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'N/A']);

export async function GET(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'trials');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    const query = parseOptionalString(searchParams.get('query'), 120);
    const condition = parseOptionalString(searchParams.get('condition'), 120);
    const location = parseOptionalString(searchParams.get('location'), 120);
    const status = parseOptionalString(searchParams.get('status'), 30);
    const phase = parseOptionalString(searchParams.get('phase'), 30);
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), 10, 50);
    const pageToken = parseOptionalString(searchParams.get('pageToken'), 120);

    if (status && !ALLOWED_STATUSES.has(status.toUpperCase())) {
      return createApiError('Unsupported trial status.', 400);
    }

    if (phase && !ALLOWED_PHASES.has(phase)) {
      return createApiError('Unsupported trial phase.', 400);
    }

    const params = {
      query,
      condition,
      location,
      status,
      phase,
      pageSize,
      pageToken,
    };

    const apiResponse = await searchTrials(params);
    const transformedData = transformClinicalTrialData(apiResponse);

    return NextResponse.json({
      trials: transformedData,
      nextPageToken: apiResponse.nextPageToken,
    });
  } catch (error) {
    console.error('Error fetching trials:', error);
    return createApiError(sanitizeError(error, 'Failed to fetch trials'), 502);
  }
}