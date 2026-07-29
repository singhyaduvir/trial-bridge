'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile, type AuthUserMetadata } from '@/lib/auth/supabase';
import { loadUserRole, savePatientType, saveUserEmail, saveUserRole } from '@/lib/auth/storage';
import type { Role } from '@/lib/constants/roles';

type RequireRoleProps = {
  requiredRole: Role;
  children: ReactNode;
  redirectTo?: string;
};

export default function RequireRole({ requiredRole, children, redirectTo }: RequireRoleProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function verifyAccess() {
      const storedRole = loadUserRole();
      const { data, error } = await getCurrentUserProfile();

      if (!isActive) return;

      if (error || !data?.user) {
        router.replace(redirectTo ?? '/login');
        return;
      }

      const metadata = data.user.user_metadata as AuthUserMetadata | undefined;
      const effectiveRole = (metadata?.role ?? storedRole) as Role | undefined;

      if (metadata?.role) {
        saveUserRole(metadata.role);
      }
      if (metadata?.patientType) {
        savePatientType(metadata.patientType);
      }
      if (data.user.email) {
        saveUserEmail(data.user.email);
      }

      if (!effectiveRole) {
        router.replace(redirectTo ?? '/login');
        return;
      }

      if (effectiveRole !== requiredRole) {
        const fallbackTarget = redirectTo ?? `/login?mode=signup&role=${requiredRole}`;
        router.replace(fallbackTarget);
        return;
      }

      setIsAuthorized(true);
    }

    void verifyAccess();

    return () => {
      isActive = false;
    };
  }, [redirectTo, requiredRole, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gemini-canvas flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gemini-accent mx-auto" />
          <p className="mt-4 text-gemini-muted">Checking your access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
