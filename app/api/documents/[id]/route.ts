import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const document = await prisma.medicalDocument.findFirst({
      where: patientId ? { id, patientId } : { id },
    });

    if (!document) {
      return createApiError('Document not found.', 404);
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([document.storagePath]);

    if (deleteError) {
      return createApiError(deleteError.message, 502);
    }

    await prisma.medicalDocument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return createApiError(sanitizeError(error, 'Failed to delete document'), 502);
  }
}
