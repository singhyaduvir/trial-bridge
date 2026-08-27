'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavLink from '@/components/DashboardNavLink';
import { getCurrentUserProfile, signOut } from '@/lib/auth/supabase';
import { clearAuthStorage } from '@/lib/auth/storage';

const Header = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuthState() {
      const { data } = await getCurrentUserProfile();
      if (!active) return;
      setIsAuthenticated(Boolean(data?.user));
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
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center">
        <div className="mr-4 gemini-brand-icon">
          <Image
            src="/SeparateLogo.png"
            alt="Trial Bridge Logo"
            width={75}
            height={75}
            className="rounded-full bg-gemini-canvas"
          />
        </div>

        <div className="font-bold text-3xl flex items-center gemini-gradient-text">
          Bifrost
        </div>
      </div>
      <nav className="hidden md:flex items-center space-x-8 font-medium">
        <Link href="/" className="gemini-nav-link">Home</Link>
        <DashboardNavLink />
        <Link href="/how-it-works" className="gemini-nav-link">How it Works</Link>
        <Link href="/about" className="gemini-nav-link">About</Link>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="gemini-nav-link cursor-pointer border-0 bg-transparent p-0"
          >
            Log out
          </button>
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
