import test from 'node:test';
import assert from 'node:assert/strict';

import { transformClinicalTrialData } from '../lib/trialTransformers';

test('transformClinicalTrialData accepts a single-study API response', () => {
  const response = {
    protocolSection: {
      identificationModule: {
        nctId: 'NCT12345678',
        briefTitle: 'Example Trial',
        officialTitle: 'Example Trial Official',
      },
      statusModule: {
        overallStatus: 'RECRUITING',
        startDateStruct: { date: '2024-01-01' },
        completionDateStruct: { date: '2025-01-01' },
      },
      designModule: {
        phase: ['Phase 2'],
        studyType: 'Interventional',
      },
      conditionsModule: {
        conditions: ['Lung Cancer'],
      },
      eligibilityModule: {
        eligibilityCriteria: 'Inclusion Criteria:\nAge 18+\nExclusion Criteria:\nCurrent chemotherapy',
        healthyVolunteers: false,
        sex: 'All',
        minimumAge: '18 Years',
        maximumAge: 'N/A',
      },
      contactsLocationsModule: {
        centralContacts: [{ name: 'Dr. Smith', email: 'doctor@example.com', phone: '555-1234' }],
        locations: [{ facility: 'City Hospital', city: 'Boston', state: 'MA', country: 'United States' }],
      },
      descriptionModule: {
        briefSummary: 'Test summary',
        detailedDescription: 'Detailed description',
      },
      sponsorCollaboratorsModule: {
        leadSponsor: { name: 'Test Sponsor' },
      },
    },
  };

  const result = transformClinicalTrialData(response as any);

  assert.equal(result[0].id, 'NCT12345678');
  assert.equal(result[0].phase, 'Phase 2');
  assert.equal(result[0].condition, 'Lung Cancer');
  assert.equal(result[0].contactEmail, 'doctor@example.com');
  assert.ok(result[0].eligibilityCriteria.length >= 2);
});
