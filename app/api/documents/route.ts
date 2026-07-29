import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
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
    const documents = await prisma.medicalDocument.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { uploadedAt: 'desc' },
    }) as Array<{
      id: string;
      patientId: string | null;
      typeId: string;
      label: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      storagePath: string;
      uploadedAt: Date;
    }>;

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const { data, error } = await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(doc.storagePath, SIGNED_URL_EXPIRY_SECONDS);

        if (error) {
          throw new Error(`Unable to generate download URL: ${error.message}`);
        }

        return {
          id: doc.id,
          patientId: doc.patientId ?? undefined,
          typeId: doc.typeId,
          label: doc.label,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          sizeBytes: doc.sizeBytes,
          uploadedAt: doc.uploadedAt.toISOString(),
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

    const document = await prisma.medicalDocument.create({
      data: {
        typeId,
        label: label.trim(),
        fileName: safeFileName,
        mimeType,
        sizeBytes: parsedSizeBytes,
        storagePath,
        patientId: patientId || undefined,
      },
    });

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

    if (signedUrlError) {
      return createApiError(signedUrlError.message, 502);
    }

    return NextResponse.json({
      id: document.id,
      patientId: document.patientId ?? undefined,
      typeId: document.typeId,
      label: document.label,
      fileName: document.fileName,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      uploadedAt: document.uploadedAt.toISOString(),
      downloadUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return createApiError(sanitizeError(error, 'Failed to upload document'), 502);
  }
}
