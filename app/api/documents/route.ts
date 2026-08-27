import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createApiError,
  enforceRateLimit,
  parseOptionalString,
  sanitizeError,
  sanitizeFilename,
  isValidUuid,
} from '@/lib/api/security';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'medical-documents';
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

function normalizeDocumentRow(row: any) {
  return {
    id: row.id,
    patientId: row.patient_id ?? undefined,
    typeId: row.type_id,
    label: row.label,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes ?? 0),
    storagePath: row.storage_path,
    uploadedAt: new Date(row.uploaded_at ?? Date.now()),
  };
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'documents');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const url = new URL(request.url);
  const patientId = parseOptionalString(url.searchParams.get('patientId'), 64);

  if (patientId && !isValidUuid(patientId)) {
    return createApiError('Invalid patient identifier.', 400);
  }

  try {
    let query = supabaseAdmin.from('medical_documents').select('*');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data: documents, error } = await query.order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const rows = documents ?? [];
    const documentsWithUrls = await Promise.all(
      rows.map(async (doc) => {
        const normalized = normalizeDocumentRow(doc);
        const { data, error: signedUrlError } = await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(normalized.storagePath, SIGNED_URL_EXPIRY_SECONDS);

        if (signedUrlError) {
          throw new Error(`Unable to generate download URL: ${signedUrlError.message}`);
        }

        return {
          id: normalized.id,
          patientId: normalized.patientId,
          typeId: normalized.typeId,
          label: normalized.label,
          fileName: normalized.fileName,
          mimeType: normalized.mimeType,
          sizeBytes: normalized.sizeBytes,
          uploadedAt: normalized.uploadedAt.toISOString(),
          downloadUrl: data.signedUrl,
        };
      }),
    );

    return NextResponse.json(documentsWithUrls);
  } catch (error) {
    console.error('Error listing documents:', error);
    return createApiError(sanitizeError(error, 'Failed to list documents'), 502);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'documents');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const typeId = parseOptionalString(formData.get('typeId')?.toString(), 64);
    const label = parseOptionalString(formData.get('label')?.toString(), 180);
    const fileName = parseOptionalString(formData.get('fileName')?.toString(), 180);
    const mimeType = parseOptionalString(formData.get('mimeType')?.toString(), 120);
    const sizeBytes = formData.get('sizeBytes')?.toString();
    const patientId = parseOptionalString(formData.get('patientId')?.toString(), 64);

    if (!(file instanceof File)) {
      return createApiError('File is required.', 400);
    }

    if (!typeId) {
      return createApiError('Document type is required.', 400);
    }

    if (!label) {
      return createApiError('Document label is required.', 400);
    }

    if (!fileName) {
      return createApiError('File name is required.', 400);
    }

    if (!mimeType || !/^[a-zA-Z0-9!#$%&'*+.^_`|~-]+\/[a-zA-Z0-9!#$%&'*+.^_`|~-]+$/.test(mimeType)) {
      return createApiError('MIME type is required.', 400);
    }

    if (patientId && !isValidUuid(patientId)) {
      return createApiError('Invalid patient identifier.', 400);
    }

    const parsedSizeBytes = Number(sizeBytes);
    if (!sizeBytes || Number.isNaN(parsedSizeBytes) || parsedSizeBytes <= 0 || parsedSizeBytes > 25 * 1024 * 1024) {
      return createApiError('File size is invalid.', 400);
    }

    const safeFileName = sanitizeFilename(fileName);
    const storagePath = `patient-documents/${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      return createApiError(uploadError.message, 502);
    }

    const { data: document, error: insertError } = await supabaseAdmin
      .from('medical_documents')
      .insert({
        type_id: typeId,
        label: label.trim(),
        file_name: safeFileName,
        mime_type: mimeType,
        size_bytes: parsedSizeBytes,
        storage_path: storagePath,
        patient_id: patientId || null,
      })
      .select()
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);
      throw new Error(insertError.message);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

    if (signedUrlError) {
      return createApiError(signedUrlError.message, 502);
    }

    const normalized = normalizeDocumentRow(document);

    return NextResponse.json({
      id: normalized.id,
      patientId: normalized.patientId,
      typeId: normalized.typeId,
      label: normalized.label,
      fileName: normalized.fileName,
      mimeType: normalized.mimeType,
      sizeBytes: normalized.sizeBytes,
      uploadedAt: normalized.uploadedAt.toISOString(),
      downloadUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return createApiError(sanitizeError(error, 'Failed to upload document'), 502);
  }
}
