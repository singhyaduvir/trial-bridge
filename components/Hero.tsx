'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '@/lib/auth/supabase';
import { loadUserRole } from '@/lib/auth/storage';
import { getDashboardRouteForRole } from '@/lib/constants/roles';
import HeroGallery from './HeroGallery';

const Hero = () => {
  const [dashboardHref, setDashboardHref] = useState('/login?mode=signup');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [resolved, setResolved] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function resolveDashboardState() {
      // read localStorage and supabase only on client after mount
      const storedRole = loadUserRole();

      const { data, error } = await getCurrentUserProfile();

      if (!active) return;

      if (error || !data?.user) {
        setIsAuthenticated(false);
        setDashboardHref('/login?mode=signup');
        setResolved(true);
        return;
      }

      const metadataRole = data.user.user_metadata?.role;
      const resolvedRole = metadataRole ?? storedRole;
      setIsAuthenticated(true);
      setDashboardHref(getDashboardRouteForRole(resolvedRole));
      setResolved(true);
    }

    void resolveDashboardState();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between py-12 md:py-20 gap-8">
      {/* Left Side: Text Content */}
      <div className="w-full md:w-1/2 flex flex-col items-start space-y-6 pl-6 md:pl-12 md:sticky md:top-1/2 md:-translate-y-1/2 md:self-start">
        {!resolved ? (
          // Skeleton while resolving
          <>
            <div className="h-12 w-3/4 bg-gemini-surface rounded-md animate-pulse" />
            <div className="h-4 w-2/3 bg-gemini-surface rounded-md animate-pulse" />
            <div className="h-10 w-40 bg-gemini-surface rounded-full animate-pulse mt-2" />
          </>
        ) : (
          <>
            <h1 className="gemini-heading-hero gemini-gradient-text">
              Connecting you to tomorrow&apos;s medicine
            </h1>
            <p className="text-lg text-gemini-muted max-w-lg">
              TrialBridge matches patients to clinical trials tailored to their condition — unlocking personalized treatment options.
            </p>
            <Link
              href={isAuthenticated ? dashboardHref : '/login?mode=signup'}
              className="gemini-btn gemini-btn-pill"
            >
              {isAuthenticated ? 'GO TO DASHBOARD' : 'GET STARTED'}
            </Link>
          </>
        )}
      </div>

      {/* Right Side: The Mini Zigzag Gallery */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <HeroGallery />
      </div>
    </section>
  );
};

export default Hero;
