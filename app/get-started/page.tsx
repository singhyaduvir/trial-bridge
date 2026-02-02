'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import RoleSelection from '@/components/RoleSelection';
import TrialEligibilityForm from '@/components/TrialEligibilityForm';
import HealthcareProfessionalDashboard from '@/components/HealthcareProfessionalDashboard';
import InvestigatorDashboard from '@/components/InvestigatorDashboard';

export default function GetStartedPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Header />
      </div>
      {selectedRole === 'healthcare-professional' ? (
        <HealthcareProfessionalDashboard />
      ) : selectedRole === 'investigator' ? (
        <InvestigatorDashboard />
      ) : selectedRole ? (
        <TrialEligibilityForm />
      ) : (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}
    </main>
  );
}