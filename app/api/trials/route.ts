// app/api/trials/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchTrials } from '@/lib/clinicalTrialsApi';
import { transformClinicalTrialData } from '@/lib/trialTransformers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params = {
      query: searchParams.get('query') || undefined,
      condition: searchParams.get('condition') || undefined,
      location: searchParams.get('location') || undefined,
      status: searchParams.get('status') || undefined,
      phase: searchParams.get('phase') || undefined,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10,
      pageToken: searchParams.get('pageToken') || undefined,
    };

    const apiResponse = await searchTrials(params);
    const transformedData = transformClinicalTrialData(apiResponse);

    return NextResponse.json({
      trials: transformedData,
      nextPageToken: apiResponse.nextPageToken,
    });
  } catch (error) {
    console.error('Error fetching trials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trials' },
      { status: 500 }
    );
  }
}