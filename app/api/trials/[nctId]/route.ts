// app/api/trials/[nctId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTrialById } from '@/lib/clinicalTrialsApi';
import { transformClinicalTrialData } from '@/lib/trialTransformers';
import { mockStudies } from '@/lib/mock/studies';
import {
  createApiError,
  enforceRateLimit,
  isValidNctId,
  sanitizeError,
} from '@/lib/api/security';

function mapMockStudyToTrial(study: (typeof mockStudies)[number]) {
  return {
    id: study.id,
    title: study.title,
    condition: study.condition,
    phase: study.phase,
    sponsor: study.sponsor,
    location: study.location,
    description: study.description,
    eligibilityCriteria: study.eligibilityCriteria,
    duration: study.duration,
    enrollmentStatus: study.status,
    contactEmail: study.participants?.[0]?.contactEmail ?? 'Contact information not available',
    requirements: [],
    nextSteps: [],
    matchScore: 0,
  };
}

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

    try {
      const apiResponse = await getTrialById(nctId.toUpperCase());
      const transformedData = transformClinicalTrialData(apiResponse);

      if (transformedData.length > 0) {
        return NextResponse.json({
          trial: transformedData[0],
        });
      }
    } catch (error) {
      console.warn(`Trial API lookup failed for ${nctId}, falling back to mock data:`, error);
    }

    const fallbackStudy = mockStudies.find((study) => study.id.toUpperCase() === nctId.toUpperCase());

    if (fallbackStudy) {
      return NextResponse.json({
        trial: mapMockStudyToTrial(fallbackStudy),
      });
    }

    return createApiError('Trial not found.', 404);
  } catch (error) {
    console.error('Error fetching trial:', error);
    return createApiError(sanitizeError(error, 'Failed to fetch trial'), 502);
  }
}