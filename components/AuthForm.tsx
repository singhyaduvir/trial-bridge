'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROLES, type Role } from '@/lib/constants/roles';
import {
  saveUserRole,
  saveUserEmail,
  savePatientType,
} from '@/lib/auth/storage';
import {
  signInWithPassword,
  signUpWithRole,
  getCurrentUserProfile,
  type AuthUserMetadata,
} from '@/lib/auth/supabase';

const patientTypeOptions = [
  'Active patient',
  'In remission',
  'Healthy volunteer',
  'Other',
] as const;

type PatientTypeOption = (typeof patientTypeOptions)[number];

const ROUTES_BY_ROLE: Record<Role, string> = {
  patient: '/patient/dashboard',
  'healthcare-professional': '/healthcare-professional/dashboard',
  investigator: '/investigator/dashboard',
};

const inputClass = 'gemini-input';
const ROLE_VALUES = Object.values(ROLES) as Role[];

function getRoleFromSearchParams(searchParams: { get(name: string): string | null } | null): Role | undefined {
  const roleValue = searchParams?.get('role');
  if (roleValue && ROLE_VALUES.includes(roleValue as Role)) {
    return roleValue as Role;
  }
  return undefined;
}

function destinationForRole(role?: Role): string {
  if (!role) return '/login';
  return ROUTES_BY_ROLE[role] ?? '/login';
}

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = getRoleFromSearchParams(searchParams) ?? 'patient';
  const initialMode = searchParams?.get('mode') === 'signup' || Boolean(getRoleFromSearchParams(searchParams))
    ? 'signup'
    : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>(initialRole);
  const [patientType, setPatientType] = useState<PatientTypeOption>('Active patient');
  const [otherPatientType, setOtherPatientType] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkCurrentUser() {
      const { data, error } = await getCurrentUserProfile();
      if (error) return;
      if (data?.user) {
        const metadata = data.user.user_metadata as AuthUserMetadata | undefined;
        if (metadata?.role) {
          saveUserRole(metadata.role);
        }
        if (metadata?.patientType) {
          savePatientType(metadata.patientType);
        }
        if (data.user.email) {
          saveUserEmail(data.user.email);
        }
        const destination = destinationForRole(metadata?.role as Role | undefined);
        router.replace(destination);
      }
    }

    checkCurrentUser();
  }, [router]);

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const getSelectedPatientType = () => {
    if (patientType === 'Other') {
      return otherPatientType.trim() || '';
    }
    return patientType;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage('Password and confirmation must match.');
        setIsSubmitting(false);
        return;
      }

      if (role === 'patient' && patientType === 'Other' && !otherPatientType.trim()) {
        setErrorMessage('Please describe your patient type.');
        setIsSubmitting(false);
        return;
      }

      setStatusMessage('Creating your account...');
      const selectedPatientType = role === 'patient' ? getSelectedPatientType() : undefined;

      const { data, error } = await signUpWithRole(email.trim(), password.trim(), role, selectedPatientType);
      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        saveUserRole(role);
        saveUserEmail(email.trim());
        if (selectedPatientType) {
          savePatientType(selectedPatientType);
        }
        setStatusMessage('Account created successfully. Redirecting...');
        router.push(destinationForRole(role));
        return;
      }

      setStatusMessage('Please check your email to confirm your account.');
      setIsSubmitting(false);
      return;
    }

    setStatusMessage('Signing in...');
    const { data, error } = await signInWithPassword(email.trim(), password.trim());
    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data?.user) {
      const metadata = data.user.user_metadata as AuthUserMetadata | undefined;
      if (metadata?.role) {
        saveUserRole(metadata.role);
      }
      if (metadata?.patientType) {
        savePatientType(metadata.patientType);
      }
      if (data.user.email) {
        saveUserEmail(data.user.email);
      }
      setStatusMessage('Signed in successfully. Redirecting...');
      router.push(destinationForRole(metadata?.role as Role | undefined));
      return;
    }

    setErrorMessage('Unable to sign in. Please try again.');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gemini-canvas flex items-center justify-center py-12 px-6">
      <div className="max-w-2xl w-full">
        <div className="gemini-card p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-gemini-primary">{mode === 'login' ? 'Login' : 'Sign up'}</h1>
              <p className="mt-2 text-sm text-gemini-muted max-w-xl">
                {mode === 'login'
                  ? 'Access your Trial Bridge account to manage eligibility, patient data, and trial matches.'
                  : 'Create a new account and choose the role that best fits your workflow.'}
              </p>
            </div>
            <button
              type="button"
              className="mt-4 text-sm text-gemini-muted hover:text-gemini-primary transition-colors duration-200"
              onClick={handleToggleMode}
            >
              {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gemini-primary mb-2">Email</label>
              <input
                type="email"
                className={inputClass}
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gemini-primary mb-2">Password</label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gemini-primary mb-2">Confirm password</label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gemini-primary mb-2">Select your account role</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(ROLES).map(([key, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`rounded-2xl p-4 border transition-colors duration-200 text-left ${
                        role === value
                          ? 'border-gemini-accent bg-gemini-accent-subtle'
                          : 'border-gemini-border bg-gemini-surface hover:border-gemini-primary'
                      }`}
                    >
                      <p className="font-medium text-gemini-primary capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="mt-1 text-sm text-gemini-muted">
                        {value === 'patient'
                          ? 'Patient account'
                          : value === 'healthcare-professional'
                          ? 'Healthcare professional'
                          : 'Investigator account'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gemini-primary mb-2">Patient type</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {patientTypeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPatientType(option)}
                      className={`rounded-2xl p-4 border transition-colors duration-200 text-left ${
                        patientType === option
                          ? 'border-gemini-accent bg-gemini-accent-subtle'
                          : 'border-gemini-border bg-gemini-surface hover:border-gemini-primary'
                      }`}
                    >
                      <p className="font-medium text-gemini-primary">{option}</p>
                    </button>
                  ))}
                </div>

                {patientType === 'Other' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gemini-primary mb-2">Describe your patient type</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Reason for trial participation"
                      value={otherPatientType}
                      onChange={(event) => setOtherPatientType(event.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-gemini-error-border bg-gemini-error-bg p-4 text-sm text-gemini-error-text">
                {errorMessage}
              </div>
            )}

            {statusMessage && (
              <div className="rounded-2xl border border-gemini-success-border bg-gemini-success-bg p-4 text-sm text-gemini-success-text">
                {statusMessage}
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="px-8 py-3 border-2 border-gemini-accent text-gemini-accent font-medium rounded-xl transition-all duration-200 hover:bg-gemini-accent hover:text-gemini-canvas hover:border-gemini-accent"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Working…' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
