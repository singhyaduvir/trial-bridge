// app/api/trials/[nctId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTrialById } from '@/lib/clinicalTrialsApi';
import { transformClinicalTrialData } from '@/lib/trialTransformers';
import {
  createApiError,
  enforceRateLimit,
  isValidNctId,
  sanitizeError,
} from '@/lib/api/security';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nctId: string }> }
) {
  const rateLimitResponse = enforceRateLimit(request, 'trial');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { nctId } = await context.params;

    if (!isValidNctId(nctId)) {
      return createApiError('Invalid trial identifier.', 400);
    }

    const apiResponse = await getTrialById(nctId.toUpperCase());
    const transformedData = transformClinicalTrialData(apiResponse);

    if (transformedData.length === 0) {
      return createApiError('Trial not found.', 404);
    }

    return NextResponse.json({
      trial: transformedData[0],
    });
  } catch (error) {
    console.error('Error fetching trial:', error);
    return createApiError(sanitizeError(error, 'Failed to fetch trial'), 502);
  }
}