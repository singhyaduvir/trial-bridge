// lib/clinicalTrialsApi.ts

const API_BASE_URL = 'https://clinicaltrials.gov/api/v2';

export type ClinicalTrialResponse = {
  studies: Array<{
    protocolSection: {
      identificationModule: {
        nctId: string;
        briefTitle: string;
        officialTitle: string;
      };
      statusModule: {
        overallStatus: string;
        startDateStruct: {
          date: string;
        };
        completionDateStruct?: {
          date: string;
        };
      };
      designModule: {
        phase: string[];
        studyType: string;
      };
      conditionsModule: {
        conditions: string[];
      };
      eligibilityModule: {
        eligibilityCriteria: string;
        healthyVolunteers: string;
        sex: string;
        minimumAge: string;
        maximumAge: string;
      };
      contactsLocationsModule: {
        centralContacts?: Array<{
          name: string;
          email: string;
          phone: string;
        }>;
        locations?: Array<{
          facility: string;
          city: string;
          state: string;
          country: string;
        }>;
      };
      descriptionModule: {
        briefSummary: string;
        detailedDescription: string;
      };
      sponsorCollaboratorsModule: {
        leadSponsor: {
          name: string;
        };
      };
    };
  }>;
  nextPageToken?: string;
};

export async function searchTrials(params: {
  query?: string;
  condition?: string;
  location?: string;
  status?: string;
  phase?: string;
  pageSize?: number;
  pageToken?: string;
}): Promise<ClinicalTrialResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.append('query.cond', params.query);
  if (params.condition) queryParams.append('filter.conditions', params.condition);
  if (params.location) queryParams.append('filter.locations', params.location);
  if (params.status) queryParams.append('filter.overallStatus', params.status);
  if (params.phase) queryParams.append('filter.phases', params.phase);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.pageToken) queryParams.append('pageToken', params.pageToken);

  const response = await fetch(`${API_BASE_URL}/studies?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getTrialById(nctId: string): Promise<ClinicalTrialResponse> {
  const response = await fetch(`${API_BASE_URL}/studies/${nctId}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}