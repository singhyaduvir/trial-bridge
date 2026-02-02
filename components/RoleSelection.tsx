'use client';

import React, { useState } from 'react';

type Role = 'patient' | 'healthcare-professional' | 'investigator';

type RoleSelectionProps = {
  onRoleSelect: (role: string) => void;
};

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  const roles: Array<{ id: Role; label: string; description: string }> = [
    { 
      id: 'patient', 
      label: 'Patient', 
      description: 'I am looking for clinical trials that match my condition'
    },
    { 
      id: 'healthcare-professional', 
      label: 'Healthcare Professional', 
      description: 'I am helping a patient find suitable clinical trials'
    },
    { 
      id: 'investigator', 
      label: 'Study/Trial Investigator', 
      description: 'I am managing or conducting a clinical trial study'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 text-center">
            Which best describes you?
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Select the option that best matches your role
          </p>

          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all duration-200 ${
                  selectedRole === role.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {role.label}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {role.description}
                    </p>
                  </div>
                  <div className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === role.id
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedRole === role.id && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedRole && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleContinue}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}