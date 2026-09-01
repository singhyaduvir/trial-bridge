'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavLink from '@/components/DashboardNavLink';
import { getCurrentUserProfile, signOut } from '@/lib/auth/supabase';
import { clearAuthStorage, loadUserRole } from '@/lib/auth/storage';
import { getDashboardRouteForRole } from '@/lib/constants/roles';

const Header = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardHref, setDashboardHref] = useState('/patient/dashboard');

  useEffect(() => {
    let active = true;

    async function checkAuthState() {
      const storedRole = loadUserRole();
      const { data } = await getCurrentUserProfile();
      if (!active) return;

      const resolvedRole = data?.user?.user_metadata?.role ?? storedRole;
      setIsAuthenticated(Boolean(data?.user));
      setDashboardHref(getDashboardRouteForRole(resolvedRole));
    }

    void checkAuthState();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }

    clearAuthStorage();
    setIsAuthenticated(false);
    setDashboardHref('/patient/dashboard');
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center">
        {/* Keep the wrapper plain so any brand CSS won't add a colored background */}
        <div className="mr-4">
          <Image
            src="/bifrost_logo.svg"
            alt="Bifrost Logo"
            width={350}
            height={350}
            // show the SVG as-is with transparent background
            className="block bg-transparent"
            style={{ background: 'transparent', boxShadow: 'none' }}
          />
        </div>
      </div>
      <nav className="hidden md:flex items-center space-x-8 font-medium">
        <Link href="/" className="gemini-nav-link">Home</Link>
        <DashboardNavLink />
        <Link href="/how-it-works" className="gemini-nav-link">How it Works</Link>
        <Link href="/about" className="gemini-nav-link">About</Link>

        {isAuthenticated ? (
          <>
            <Link href={dashboardHref} className="gemini-nav-link">Go to Dashboard</Link>
            <button
              type="button"
              onClick={handleLogout}
              className="gemini-nav-link cursor-pointer border-0 bg-transparent p-0"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login?mode=signup" className="gemini-nav-link">Get Started</Link>
            <Link href="/login" className="gemini-nav-link">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
