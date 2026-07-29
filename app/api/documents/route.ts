import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'medical-documents';
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');

  const documents = await prisma.medicalDocument.findMany({
    where: patientId ? { patientId } : undefined,
    orderBy: { uploadedAt: 'desc' },
  });

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
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const typeId = formData.get('typeId');
  const label = formData.get('label');
  const fileName = formData.get('fileName');
  const mimeType = formData.get('mimeType');
  const sizeBytes = formData.get('sizeBytes');
  const patientId = formData.get('patientId');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  if (typeof typeId !== 'string' || !typeId) {
    return NextResponse.json({ error: 'Document type is required.' }, { status: 400 });
  }

  if (typeof label !== 'string' || !label.trim()) {
    return NextResponse.json({ error: 'Document label is required.' }, { status: 400 });
  }

  if (typeof fileName !== 'string' || !fileName) {
    return NextResponse.json({ error: 'File name is required.' }, { status: 400 });
  }

  if (typeof mimeType !== 'string' || !mimeType) {
    return NextResponse.json({ error: 'MIME type is required.' }, { status: 400 });
  }

  const parsedSizeBytes = Number(sizeBytes);
  if (typeof sizeBytes !== 'string' || Number.isNaN(parsedSizeBytes) || parsedSizeBytes <= 0) {
    return NextResponse.json({ error: 'File size is invalid.' }, { status: 400 });
  }

  const storagePath = `patient-documents/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const document = await prisma.medicalDocument.create({
    data: {
      typeId,
      label: label.trim(),
      fileName,
      mimeType,
      sizeBytes: parsedSizeBytes,
      storagePath,
      patientId: typeof patientId === 'string' && patientId ? patientId : undefined,
    },
  });

  const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (signedUrlError) {
    return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
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
}
