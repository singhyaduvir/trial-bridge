import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'medical-documents';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');

  const document = await prisma.medicalDocument.findFirst({
    where: patientId ? { id, patientId } : { id },
  });

  if (!document) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  }

  const { error: deleteError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove([document.storagePath]);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await prisma.medicalDocument.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
