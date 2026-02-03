// lib/trialTransformers.ts

import { ClinicalTrialResponse } from './clinicalTrialsApi';

export type TransformedTrial = {
  id: string;
  title: string;
  condition: string;
  phase: string;
  sponsor: string;
  location: string;
  distance?: string;
  matchScore: number; // Made required with default
  description: string;
  eligibilityCriteria: string[];
  duration: string;
  compensation?: string;
  requirements: string[];
  nextSteps: string[];
  contactEmail: string;
  enrollmentStatus: string;
  spotsRemaining?: number;
};

export function transformClinicalTrialData(
  apiResponse: ClinicalTrialResponse,
  userLocation?: { lat: number; lng: number }
): TransformedTrial[] {
  return apiResponse.studies.map((study) => {
    const protocol = study.protocolSection;
    const identification = protocol.identificationModule;
    const status = protocol.statusModule;
    const design = protocol.designModule;
    const conditions = protocol.conditionsModule;
    const eligibility = protocol.eligibilityModule;
    const contacts = protocol.contactsLocationsModule;
    const description = protocol.descriptionModule;
    const sponsor = protocol.sponsorCollaboratorsModule;

    // Extract eligibility criteria from text
    const eligibilityCriteria = eligibility.eligibilityCriteria
      ? parseEligibilityCriteria(eligibility.eligibilityCriteria)
      : [];

    // Format location
    const location = contacts.locations?.[0]
      ? `${contacts.locations[0].facility}, ${contacts.locations[0].city}, ${contacts.locations[0].state}`
      : 'Location not specified';

    // Format phase
    const phase = design.phase && design.phase.length > 0
      ? design.phase[0]
      : 'Not specified';

    // Calculate duration
    const startDate = status.startDateStruct?.date;
    const endDate = status.completionDateStruct?.date;
    const duration = startDate && endDate
      ? calculateDuration(startDate, endDate)
      : 'Ongoing';

    // Get contact email
    const contactEmail = contacts.centralContacts?.[0]?.email || 'Contact information not available';

    return {
      id: identification.nctId,
      title: identification.briefTitle || identification.officialTitle,
      condition: conditions.conditions?.[0] || 'Not specified',
      phase: phase,
      sponsor: sponsor.leadSponsor?.name || 'Not specified',
      location: location,
      description: description.briefSummary || description.detailedDescription || 'No description available',
      eligibilityCriteria: eligibilityCriteria,
      duration: duration,
      contactEmail: contactEmail,
      enrollmentStatus: status.overallStatus || 'Unknown',
      matchScore: 0, // Default match score - will be calculated by matching algorithm
      requirements: generateDefaultRequirements(design.studyType, phase),
      nextSteps: generateDefaultNextSteps(),
    };
  });
}

function parseEligibilityCriteria(criteriaText: string): string[] {
  // Improved parsing - split by common delimiters and clean up
  const lines = criteriaText
    .split(/\n|\r|(?=Inclusion Criteria:)|(?=Exclusion Criteria:)/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^(Inclusion|Exclusion) Criteria:/i));
  
  return lines.slice(0, 15); // Limit to first 15 criteria
}

function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (months < 12) {
    return `${months} months`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years} years, ${remainingMonths} months` : `${years} years`;
  }
}

function generateDefaultRequirements(studyType?: string, phase?: string): string[] {
  const requirements = [
    'Regular clinic visits as scheduled',
    'Compliance with study protocol',
    'Completion of required assessments',
  ];
  
  if (studyType?.toLowerCase().includes('interventional')) {
    requirements.push('Administration of study treatment');
  }
  
  return requirements;
}

function generateDefaultNextSteps(): string[] {
  return [
    'Initial screening call with study coordinator',
    'Review of medical records',
    'In-person screening visit',
    'Baseline assessments and testing',
  ];
}