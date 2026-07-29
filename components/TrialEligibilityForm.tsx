'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ELIGIBILITY_CATEGORIES,
  ELIGIBILITY_FORM_FIELDS,
  validateRequiredFields,
  type FormField,
} from '@/lib/eligibility/formConfig';
import { saveEligibilityFormData, loadEligibilityFormData } from '@/lib/eligibility/storage';
import { loadUserRole, savePatientType } from '@/lib/auth/storage';
import { supabase } from '@/lib/supabase/client';
import { ROLES } from '@/lib/constants/roles';
import type { CategoryId, EligibilityFormData } from '@/lib/eligibility/types';

const INPUT_CLASS = 'gemini-input';

function parseMultiselectValue(value?: string): string[] {
  if (!value?.trim()) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function FieldHelp({ text }: { text: string }) {
  return <p className="mt-1.5 text-xs text-gemini-muted">{text}</p>;
}

export default function TrialEligibilityForm() {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [formData, setFormData] = useState<EligibilityFormData>(() => loadEligibilityFormData() ?? {});
  const [completedCategories, setCompletedCategories] = useState<Set<CategoryId>>(() => {
    const saved = loadEligibilityFormData();
    const completed = new Set<CategoryId>();
    if (saved) {
      for (const category of ELIGIBILITY_CATEGORIES) {
        const fields = ELIGIBILITY_FORM_FIELDS[category.id];
        const hasValues = fields.some((f) => saved[category.id]?.[f.name]);
        if (hasValues) completed.add(category.id);
      }
    }
    return completed;
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (categoryId: CategoryId, fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [fieldName]: value,
      },
    }));
    setValidationErrors([]);
  };

  const handleMultiselectToggle = (
    categoryId: CategoryId,
    fieldName: string,
    option: string,
    checked: boolean,
  ) => {
    const current = parseMultiselectValue(formData[categoryId]?.[fieldName]);
    const next = checked ? [...current, option] : current.filter((o) => o !== option);
    handleInputChange(categoryId, fieldName, next.join(', '));
  };

  const handleNext = () => {
    setCompletedCategories((prev) => new Set([...prev, ELIGIBILITY_CATEGORIES[currentCategory].id]));
    if (currentCategory < ELIGIBILITY_CATEGORIES.length - 1) {
      setCurrentCategory(currentCategory + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const handleSubmit = async () => {
    const errors = validateRequiredFields(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setCompletedCategories((prev) => new Set([...prev, ELIGIBILITY_CATEGORIES[currentCategory].id]));
    saveEligibilityFormData(formData);

    const role = loadUserRole();
    if (role === ROLES.PATIENT) {
      const patientTypeValue =
        formData.demographics?.patientType === 'Other'
          ? formData.demographics?.patientTypeOther
          : formData.demographics?.patientType;

      if (patientTypeValue) {
        savePatientType(patientTypeValue);
        await supabase.auth.updateUser({ data: { patientType: patientTypeValue } });
      }
    }

    router.push('/matches');
  };

  const progressPercentage = ((currentCategory + 1) / ELIGIBILITY_CATEGORIES.length) * 100;
  const currentCategoryId = ELIGIBILITY_CATEGORIES[currentCategory].id;
  const fields = ELIGIBILITY_FORM_FIELDS[currentCategoryId] || [];
  const sectionData = formData[currentCategoryId] ?? {};

  const renderOtherField = (field: FormField) => {
    if (!field.otherOption || !field.otherFieldName) return null;
    if (sectionData[field.name] !== field.otherOption) return null;

    return (
      <div className="mt-3">
        <label className="block text-sm font-medium text-gemini-primary mb-2">
          {field.otherFieldLabel ?? 'Please specify'}
          <span className="text-gemini-error-text ml-1">*</span>
        </label>
        <input
          type="text"
          placeholder={field.otherPlaceholder}
          className={INPUT_CLASS}
          value={sectionData[field.otherFieldName] || ''}
          onChange={(e) =>
            handleInputChange(currentCategoryId, field.otherFieldName!, e.target.value)
          }
        />
      </div>
    );
  };

  const renderField = (field: FormField) => (
    <div key={field.name}>
      <label className="block text-sm font-medium text-gemini-primary mb-2">
        {field.label}
        {field.required && <span className="text-gemini-error-text ml-1">*</span>}
      </label>

      {(field.type === 'text' || field.type === 'number' || field.type === 'date') && (
        <input
          type={field.type}
          placeholder={field.placeholder}
          step={field.step}
          min={field.min}
          max={field.max}
          className={INPUT_CLASS}
          value={sectionData[field.name] || ''}
          onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          placeholder={field.placeholder}
          rows={3}
          className={INPUT_CLASS}
          value={sectionData[field.name] || ''}
          onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
        />
      )}

      {field.type === 'select' && (
        <>
          <select
            className={INPUT_CLASS}
            value={sectionData[field.name] || ''}
            onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {renderOtherField(field)}
        </>
      )}

      {field.type === 'multiselect' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-gemini-border p-4 bg-gemini-canvas">
          {field.options?.map((option) => {
            const selected = parseMultiselectValue(sectionData[field.name]);
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={`flex items-start gap-2 rounded-xl px-2 py-1.5 cursor-pointer text-sm text-gemini-primary ${
                  checked ? 'bg-gemini-accent-subtle ring-1 ring-gemini-accent/30' : 'hover:bg-gemini-surface-hover transition-colors duration-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    handleMultiselectToggle(
                      currentCategoryId,
                      field.name,
                      option,
                      e.target.checked,
                    )
                  }
                  className="mt-0.5 w-4 h-4 text-gemini-accent rounded border-gemini-border focus:ring-gemini-accent"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {field.type === 'radio' && (
        <div className="flex gap-4 flex-wrap">
          {field.options?.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.name}
                value={option}
                checked={sectionData[field.name] === option}
                onChange={(e) => handleInputChange(currentCategoryId, field.name, e.target.value)}
                className="w-4 h-4 text-gemini-accent focus:ring-gemini-accent"
              />
              <span className="text-sm text-gemini-primary">{option}</span>
            </label>
          ))}
        </div>
      )}

      {field.helpText && <FieldHelp text={field.helpText} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gemini-canvas">
      <div className="bg-gemini-surface border-b border-gemini-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gemini-primary">Clinical Trial Eligibility Screening</h1>
            <span className="text-sm text-gemini-muted">
              Step {currentCategory + 1} of {ELIGIBILITY_CATEGORIES.length}
            </span>
          </div>
          <div className="w-full bg-gemini-surface-hover rounded-full h-2">
            <div
              className="bg-gemini-surface h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-gemini-error-bg border border-gemini-border rounded-2xl">
            <p className="text-sm font-medium text-gemini-error-text mb-2">Please fix the following:</p>
            <ul className="list-disc list-inside text-sm text-gemini-error-text space-y-1">
              {validationErrors.slice(0, 5).map((err) => (
                <li key={err}>{err}</li>
              ))}
              {validationErrors.length > 5 && (
                <li>…and {validationErrors.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="bg-gemini-surface rounded-2xl p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-gemini-primary mb-4">Categories</h2>
              <nav className="space-y-1">
                {ELIGIBILITY_CATEGORIES.map((category, index) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCurrentCategory(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      currentCategory === index
                        ? 'bg-gemini-accent-subtle text-gemini-accent font-medium'
                        : 'text-gemini-primary hover:bg-gemini-surface-hover transition-colors duration-200'
                    }`}
                  >
                    <span className="flex-1 text-left">{category.label}</span>
                    {completedCategories.has(category.id) && (
                      <span className="text-gemini-success-text text-lg">✓</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-gemini-surface rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gemini-primary">
                  {ELIGIBILITY_CATEGORIES[currentCategory].label}
                </h2>
                <p className="text-gemini-muted mt-2">
                  Choose from the options where available. Required fields are marked with *.
                </p>
              </div>

              <div className="space-y-6">{fields.map(renderField)}</div>

              <div className="flex justify-between mt-8 pt-6 border-t border-gemini-border">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentCategory === 0}
                  className="px-6 py-2 border border-gemini-border rounded-xl text-gemini-primary hover:bg-gemini-surface-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentCategory === ELIGIBILITY_CATEGORIES.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 gemini-btn rounded-xl hover:bg-gemini-surface-hover transition-colors duration-200 flex items-center gap-2"
                  >
                    View My Matches
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 gemini-btn rounded-xl hover:bg-gemini-surface-hover transition-colors duration-200 flex items-center gap-2"
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
