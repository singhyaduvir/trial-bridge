import { Suspense } from 'react';
import PageShell from '@/components/layout/PageShell';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <PageShell fullWidth>
      <Suspense fallback={<div className="min-h-screen bg-gemini-canvas" />}>
        <AuthForm />
      </Suspense>
    </PageShell>
  );
}
