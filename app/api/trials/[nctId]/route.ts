// app/api/trials/[nctId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTrialById } from '@/lib/clinicalTrialsApi';
import { transformClinicalTrialData } from '@/lib/trialTransformers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nctId: string }> }
) {
  try {
    const { nctId } = await context.params;
    const apiResponse = await getTrialById(nctId);
    const transformedData = transformClinicalTrialData(apiResponse);
    
    if (transformedData.length === 0) {
      return NextResponse.json(
        { error: 'Trial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      trial: transformedData[0],
    });
  } catch (error) {
    console.error('Error fetching trial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trial' },
      { status: 500 }
    );
  }
}