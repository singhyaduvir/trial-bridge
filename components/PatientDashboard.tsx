'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formDataToProfile } from '@/lib/eligibility/profileFromForm';
import { loadEligibilityFormData } from '@/lib/eligibility/storage';
import type { EligibilityFormData } from '@/lib/eligibility/types';
import { listMedicalDocuments } from '@/lib/documents/storage';

export default function PatientDashboard() {
  const [formData] = useState<EligibilityFormData | null>(() => loadEligibilityFormData());
  const [documentCount, setDocumentCount] = useState(0);
  const loaded = true;

  useEffect(() => {
    listMedicalDocuments()
      .then((docs) => setDocumentCount(docs.length))
      .catch(() => setDocumentCount(0));
  }, []);

  const profile = formData ? formDataToProfile(formData) : null;
  const hasProfile = Boolean(profile?.diagnosis.diagnosis);
  const diagnosis = profile?.diagnosis.diagnosis;
  const location = profile?.demographics.location;

  return (
    <div className="min-h-screen bg-gemini-canvas">
      <div className="bg-gemini-surface border-b border-gemini-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm font-medium text-gemini-accent mb-1">Patient portal</p>
          <h1 className="text-3xl gemini-heading-lg text-gemini-primary">Your dashboard</h1>
          <p className="mt-2 text-gemini-muted max-w-2xl">
            Manage your eligibility profile, review trial matches, and organize medical records
            for your care team.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {loaded && hasProfile && (
          <section className="gemini-card p-6">
            <h2 className="text-sm font-semibold text-gemini-muted uppercase tracking-wide">
              Eligibility snapshot
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gemini-muted">Primary diagnosis</dt>
                <dd className="text-base font-medium text-gemini-primary">{diagnosis}</dd>
              </div>
              {location && (
                <div>
                  <dt className="text-sm text-gemini-muted">Location</dt>
                  <dd className="text-base font-medium text-gemini-primary">{location}</dd>
                </div>
              )}
            </dl>
            <Link
              href="/eligibility"
              className="inline-block mt-4 text-sm font-medium text-gemini-accent hover:text-gemini-accent"
            >
              Edit eligibility profile →
            </Link>
          </section>
        )}

        {loaded && !hasProfile && (
          <section className="bg-gemini-warning-bg border border-gemini-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gemini-warning-text">Complete your eligibility screening</h2>
            <p className="mt-1 text-gemini-warning-text text-sm">
              Trial matching uses your health profile. Finish the form to see personalized matches.
            </p>
            <Link
              href="/eligibility"
              className="inline-block mt-4 px-5 py-2.5 gemini-btn rounded-xl text-sm font-medium hover:bg-gemini-surface-hover"
            >
              Start eligibility form
            </Link>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-gemini-primary mb-4">Quick actions</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <DashboardActionCard
              title="Trial matches"
              description={
                hasProfile
                  ? 'View clinical trials matched to your eligibility profile.'
                  : 'Complete your eligibility form first, then view matched trials.'
              }
              href="/matches"
              cta={hasProfile ? 'View my matches' : 'Go to matches'}
              disabledHint={!hasProfile ? 'Matches work best after completing the form.' : undefined}
              icon="🔬"
            />
            <DashboardActionCard
              title="Medical documents"
              description="Upload and label blood tests, imaging, pathology reports, and more—organized by type."
              href="/patient/documents"
              cta="Manage documents"
              badge={documentCount > 0 ? `${documentCount} on file` : undefined}
              icon="📁"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

type DashboardActionCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
  badge?: string;
  disabledHint?: string;
};

function DashboardActionCard({
  title,
  description,
  href,
  cta,
  icon,
  badge,
  disabledHint,
}: DashboardActionCardProps) {
  return (
    <article className="gemini-card p-6 flex flex-col">
      <div className="flex items-start gap-4">
        <span className="text-3xl" aria-hidden>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gemini-primary">{title}</h3>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full gemini-badge gemini-badge-success">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gemini-muted">{description}</p>
          {disabledHint && <p className="mt-2 text-xs text-gemini-muted">{disabledHint}</p>}
        </div>
      </div>
      <Link
        href={href}
        className="mt-6 inline-flex justify-center px-5 py-2.5 gemini-btn rounded-xl text-sm font-medium hover:bg-gemini-surface-hover transition-colors duration-200"
      >
        {cta}
      </Link>
    </article>
  );
}
