import { NextResponse } from 'next/server';
import { getSamplePatients } from '@/lib/samplePatients';

export async function GET() {
  try {
    const patients = await getSamplePatients();
    return NextResponse.json(patients);
  } catch (err) {
    console.error('Error fetching sample patients', err);
    return NextResponse.json({ error: 'Failed to fetch sample patients' }, { status: 502 });
  }
}
