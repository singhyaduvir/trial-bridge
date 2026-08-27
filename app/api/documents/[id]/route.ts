import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createApiError,
  enforceRateLimit,
  isValidUuid,
  parseOptionalString,
  sanitizeError,
} from '@/lib/api/security';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'medical-documents';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimitResponse = enforceRateLimit(request, 'documents');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { id } = await params;
    const url = new URL(request.url);
    const patientId = parseOptionalString(url.searchParams.get('patientId'), 64);

    if (!isValidUuid(id)) {
      return createApiError('Invalid document identifier.', 400);
    }

    if (patientId && !isValidUuid(patientId)) {
      return createApiError('Invalid patient identifier.', 400);
    }

    let query = supabaseAdmin.from('medical_documents').select('*').eq('id', id);
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data: document, error: fetchError } = await query.maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message);
    }

    if (!document) {
      return createApiError('Document not found.', 404);
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([document.storage_path]);

    if (deleteError) {
      return createApiError(deleteError.message, 502);
    }

    const { error: rowDeleteError } = await supabaseAdmin
      .from('medical_documents')
      .delete()
      .eq('id', id);

    if (rowDeleteError) {
      throw new Error(rowDeleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return createApiError(sanitizeError(error, 'Failed to delete document'), 502);
  }
}
