/** Common trial conditions — aligns with ClinicalTrials.gov search terms */
export const DIAGNOSIS_OPTIONS = [
  'Non-Small Cell Lung Cancer (NSCLC)',
  'Small Cell Lung Cancer (SCLC)',
  'Breast Cancer',
  'Colorectal Cancer',
  'Melanoma',
  'Metastatic Melanoma',
  'Prostate Cancer',
  'Pancreatic Cancer',
  'Ovarian Cancer',
  'Lymphoma',
  'Leukemia',
  'Multiple Myeloma',
  'Glioblastoma',
  'Renal Cell Carcinoma',
  'Bladder Cancer',
  'Other (not listed)',
] as const;

export const BIOMARKER_OPTIONS = [
  'HER2 positive (HER2+)',
  'HER2 negative (HER2-)',
  'EGFR mutation',
  'EGFR wild-type',
  'ALK rearrangement',
  'ROS1 fusion',
  'BRAF V600 mutation',
  'BRAF wild-type',
  'KRAS mutation',
  'KRAS wild-type',
  'BRCA1 mutation',
  'BRCA2 mutation',
  'PD-L1 high (≥50%)',
  'PD-L1 low (<50%)',
  'MSI-High / dMMR',
  'TMB-High',
  'None identified',
  'Testing pending',
  'Not applicable',
] as const;

export const MUTATION_OPTIONS = [
  'BRCA1',
  'BRCA2',
  'KRAS',
  'EGFR',
  'ALK',
  'ROS1',
  'BRAF',
  'PD-L1',
  'HER2',
  'MSI / dMMR',
  'TMB',
  'None identified',
  'Testing pending',
] as const;

export const DIAGNOSTIC_TEST_OPTIONS = [
  'Not performed / not applicable',
  'PD-L1 immunohistochemistry (IHC)',
  'EGFR mutation testing',
  'ALK FISH or NGS',
  'BRAF mutation testing',
  'HER2 IHC / FISH',
  'BRCA1/2 germline testing',
  'Comprehensive genomic profiling (NGS panel)',
  'Other (specify below)',
] as const;

export const US_STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
  'Outside the United States',
] as const;
