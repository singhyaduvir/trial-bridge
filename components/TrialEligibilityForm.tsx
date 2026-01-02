'use client';

import React, { useState } from 'react';

type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  step?: string;
};

type CategoryId = 'demographics' | 'diagnosis' | 'medical-history' | 'treatments' | 'laboratory' | 'functional' | 'genetic' | 'reproductive' | 'safety' | 'administrative';

type FormData = {
  [key in CategoryId]?: {
    [fieldName: string]: string;
  };
};

const CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: 'demographics', label: 'Demographics' },
  { id: 'diagnosis', label: 'Diagnosis & Disease' },
  { id: 'medical-history', label: 'Medical History' },
  { id: 'treatments', label: 'Prior Treatments' },
  { id: 'laboratory', label: 'Laboratory Values' },
  { id: 'functional', label: 'Functional Status' },
  { id: 'genetic', label: 'Genetic Criteria' },
  { id: 'reproductive', label: 'Reproductive Health' },
  { id: 'safety', label: 'Safety Constraints' },
  { id: 'administrative', label: 'Administrative' }
];

const FORM_FIELDS: Record<CategoryId, FormField[]> = {
  demographics: [
    { name: 'age', label: 'Age', type: 'number', placeholder: 'Enter age (18-65)', required: true },
    { name: 'sexAtBirth', label: 'Sex at Birth', type: 'select', options: ['Male', 'Female'], required: true },
    { name: 'pregnant', label: 'Are you currently pregnant?', type: 'radio', options: ['Yes', 'No', 'N/A'], required: true },
    { name: 'breastfeeding', label: 'Are you currently breastfeeding?', type: 'radio', options: ['Yes', 'No', 'N/A'], required: true },
    { name: 'location', label: 'Geographic Location (City, State/Country)', type: 'text', placeholder: 'e.g., Boston, MA', required: true }
  ],
  diagnosis: [
    { name: 'diagnosis', label: 'Confirmed Diagnosis', type: 'text', placeholder: 'Enter diagnosis', required: true },
    { name: 'confirmationMethod', label: 'Confirmation Method', type: 'select', options: ['Pathology', 'Imaging', 'Laboratory', 'Clinical'], required: true },
    { name: 'diseaseSubtype', label: 'Disease Subtype/Stage/Grade', type: 'text', placeholder: 'e.g., Stage III, Grade 2' },
    { name: 'timeSinceDiagnosis', label: 'Time Since Diagnosis', type: 'text', placeholder: 'e.g., 6 months' },
    { name: 'severityScore', label: 'Disease Severity Score (if applicable)', type: 'text', placeholder: 'e.g., ECOG 1, NYHA Class II' },
    { name: 'biomarkerStatus', label: 'Biomarker Status', type: 'textarea', placeholder: 'e.g., HER2+, EGFR mutation, etc.' }
  ],
  'medical-history': [
    { name: 'comorbidities', label: 'Comorbid Conditions', type: 'textarea', placeholder: 'List any cardiac, hepatic, renal, autoimmune, psychiatric conditions' },
    { name: 'relatedDiseases', label: 'History of Related Diseases', type: 'textarea', placeholder: 'e.g., prior cancer types' },
    { name: 'surgicalHistory', label: 'Relevant Surgical History', type: 'textarea', placeholder: 'List surgeries related to your condition' },
    { name: 'allergies', label: 'Drug Allergies', type: 'textarea', placeholder: 'List all known drug allergies and reactions' }
  ],
  treatments: [
    { name: 'previousTherapies', label: 'Previous Therapies', type: 'textarea', placeholder: 'List drug names, doses, durations' },
    { name: 'washoutCompleted', label: 'Have required washout periods been completed?', type: 'radio', options: ['Yes', 'No', 'Not Applicable'] },
    { name: 'diseaseStatus', label: 'Disease Status', type: 'select', options: ['Newly Diagnosed', 'Refractory', 'Relapsed', 'Stable', 'Progressive'] },
    { name: 'currentMedications', label: 'Current Medications', type: 'textarea', placeholder: 'List all current medications with doses' },
    { name: 'otherTrials', label: 'Have you participated in other trials in the last 6 months?', type: 'radio', options: ['Yes', 'No'] }
  ],
  laboratory: [
    { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', type: 'number', placeholder: 'e.g., 12.5', step: '0.1' },
    { name: 'anc', label: 'Absolute Neutrophil Count (ANC)', type: 'number', placeholder: 'e.g., 1500' },
    { name: 'platelets', label: 'Platelet Count', type: 'number', placeholder: 'e.g., 150000' },
    { name: 'ast', label: 'AST (U/L)', type: 'number', placeholder: 'e.g., 35' },
    { name: 'alt', label: 'ALT (U/L)', type: 'number', placeholder: 'e.g., 40' },
    { name: 'bilirubin', label: 'Total Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g., 1.0', step: '0.1' },
    { name: 'creatinine', label: 'Serum Creatinine (mg/dL)', type: 'number', placeholder: 'e.g., 1.0', step: '0.1' },
    { name: 'egfr', label: 'eGFR (mL/min/1.73m²)', type: 'number', placeholder: 'e.g., 90' },
    { name: 'diseaseSpecific', label: 'Disease-Specific Labs', type: 'textarea', placeholder: 'e.g., HbA1c, viral load, tumor markers' }
  ],
  functional: [
    { name: 'ecogScore', label: 'ECOG Performance Status', type: 'select', options: ['0 - Fully active', '1 - Light work only', '2 - Ambulatory, no work', '3 - Limited self-care', '4 - Completely disabled'] },
    { name: 'dailyActivities', label: 'Ability to Perform Daily Activities', type: 'radio', options: ['Independent', 'Needs Some Assistance', 'Needs Full Assistance'] },
    { name: 'cognitiveCapacity', label: 'Cognitive Capacity to Comply with Protocol', type: 'radio', options: ['Yes', 'No', 'Uncertain'] }
  ],
  genetic: [
    { name: 'geneticTesting', label: 'Have you undergone genetic testing?', type: 'radio', options: ['Yes', 'No'] },
    { name: 'mutations', label: 'Specific Mutations or Biomarkers', type: 'textarea', placeholder: 'e.g., BRCA1, KRAS, PD-L1 expression' },
    { name: 'mutationType', label: 'Mutation Type', type: 'select', options: ['Germline', 'Somatic', 'Both', 'Unknown', 'N/A'] },
    { name: 'diagnosticTest', label: 'Companion Diagnostic Test Results', type: 'textarea', placeholder: 'Enter test name and results if applicable' }
  ],
  reproductive: [
    { name: 'fertilityStatus', label: 'Fertility Status', type: 'select', options: ['Fertile', 'Infertile', 'Post-menopausal', 'Not Applicable'] },
    { name: 'contraception', label: 'Willing to use approved contraception during trial?', type: 'radio', options: ['Yes', 'No', 'N/A'] },
    { name: 'pregnancyTest', label: 'Recent Pregnancy Test Result', type: 'select', options: ['Negative', 'Positive', 'Not Performed', 'N/A'] },
    { name: 'pregnancyTestDate', label: 'Date of Pregnancy Test', type: 'date' }
  ],
  safety: [
    { name: 'lvef', label: 'Left Ventricular Ejection Fraction (LVEF %)', type: 'number', placeholder: 'e.g., 55' },
    { name: 'infections', label: 'Infection Status', type: 'textarea', placeholder: 'HIV, HBV, HCV, TB status' },
    { name: 'qtInterval', label: 'QTc Interval (msec)', type: 'number', placeholder: 'e.g., 420' },
    { name: 'adverseReactions', label: 'History of Severe Adverse Drug Reactions', type: 'textarea', placeholder: 'Describe any severe reactions' }
  ],
  administrative: [
    { name: 'informedConsent', label: 'Able to provide informed consent?', type: 'radio', options: ['Yes', 'No'], required: true },
    { name: 'complianceWillingness', label: 'Willing to comply with all trial visits and procedures?', type: 'radio', options: ['Yes', 'No'], required: true },
    { name: 'insuranceStatus', label: 'Insurance/Coverage Status', type: 'select', options: ['Private Insurance', 'Medicare/Medicaid', 'Trial Coverage', 'Self-Pay', 'Other'] },
    { name: 'languageComprehension', label: 'Language Comprehension', type: 'text', placeholder: 'Primary language' }
  ]
};

export default function TrialEligibilityForm() {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [completedCategories, setCompletedCategories] = useState(new Set<CategoryId>());

  const handleInputChange = (categoryId: CategoryId, fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [fieldName]: value
      }
    }));
  };

  const handleNext = () => {
    setCompletedCategories(prev => new Set([...prev, CATEGORIES[currentCategory].id]));
    if (currentCategory < CATEGORIES.length - 1) {
      setCurrentCategory(currentCategory + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const handleSubmit = () => {
    setCompletedCategories(prev => new Set([...prev, CATEGORIES[currentCategory].id]));
    console.log('Form submitted:', formData);
    alert('Trial eligibility form submitted successfully!');
  };

  const progressPercentage = ((currentCategory + 1) / CATEGORIES.length) * 100;
  const currentCategoryId = CATEGORIES[currentCategory].id;
  const fields = FORM_FIELDS[currentCategoryId] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">Clinical Trial Eligibility Screening</h1>
            <span className="text-sm text-gray-600">
              Step {currentCategory + 1} of {CATEGORIES.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-1">
                {CATEGORIES.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setCurrentCategory(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentCategory === index
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-1 text-left">{category.label}</span>
                    {completedCategories.has(category.id) && (
                      <span className="text-green-600 text-lg">✓</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {CATEGORIES[currentCategory].label}
                </h2>
                <p className="text-gray-600 mt-2">
                  Please provide accurate information for eligibility assessment.
                </p>
              </div>

              <div className="space-y-6">
                {fields.map((field: FormField) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'text' || field.type === 'number' || field.type === 'date' ? (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        step={field.step}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                        value={formData[currentCategoryId]?.[field.name] || ''}
                        onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                        value={formData[currentCategoryId]?.[field.name] || ''}
                        onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData[currentCategoryId]?.[field.name] || ''}
                        onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div className="flex gap-4">
                        {field.options?.map(option => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={field.name}
                              value={option}
                              checked={formData[currentCategoryId]?.[field.name] === option}
                              onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentCategory === 0}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentCategory === CATEGORIES.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    Submit Application
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}