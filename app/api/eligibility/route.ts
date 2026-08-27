import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createApiError,
  enforceRateLimit,
  parseOptionalString,
  sanitizeError,
} from '@/lib/api/security';

export async function GET(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'eligibility');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const userId = parseOptionalString(request.nextUrl.searchParams.get('userId'), 64);
  if (!userId) {
    return createApiError('User ID is required.', 400);
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('eligibility_profiles')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return NextResponse.json({
      formData: profile?.form_data ?? null,
      createdAt: profile?.created_at ? new Date(profile.created_at).toISOString() : null,
      updatedAt: profile?.updated_at ? new Date(profile.updated_at).toISOString() : null,
    });
  } catch (error) {
    console.error('Error loading eligibility profile:', error);
    return createApiError(sanitizeError(error, 'Failed to load eligibility profile'), 502);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'eligibility');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const userId = parseOptionalString(body?.userId, 64);
    const formData = body?.formData;

    if (!userId) {
      return createApiError('User ID is required.', 400);
    }

    if (!formData || typeof formData !== 'object') {
      return createApiError('Eligibility form data is required.', 400);
    }

    const { error } = await supabaseAdmin
      .from('eligibility_profiles')
      .upsert(
        {
          supabase_user_id: userId,
          form_data: formData,
        },
        { onConflict: 'supabase_user_id' },
      );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving eligibility profile:', error);
    return createApiError(sanitizeError(error, 'Failed to save eligibility profile'), 502);
  }
}
