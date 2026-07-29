'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasCompletedEligibilityForm } from '@/lib/eligibility/storage';

const linkClass = 'gemini-nav-link';

export default function DashboardNavLink() {
  usePathname();
  const visible = hasCompletedEligibilityForm();

  if (!visible) return null;

  return (
    <Link href="/patient/dashboard" className={linkClass}>
      Dashboard
    </Link>
  );
}
