from typing import Dict, List, Any, Tuple
from datetime import datetime
from enum import Enum



class CriteriaType(Enum):
    """Types of eligibility criteria"""
    AGE_RANGE = "age_range"
    DIAGNOSIS = "diagnosis"
    BIOMARKER = "biomarker"
    MEDICATION = "medication"
    PREGNANCY_STATUS = "pregnancy_status"
    ORGAN_FUNCTION = "organ_function"
    PERFORMANCE_STATUS = "performance_status"
    PRIOR_TREATMENT = "prior_treatment"
    EXCLUSION = "exclusion"

class Patient:
    def __init__(self, demographics: Dict, disease_characteristic: Dict, medical_history: Dict, 
                 prior_current_treatments: Dict, lab_values: Dict, functional_performance_status: Dict,
                 genetic_criteria: Dict, reproductive_criteria: Dict, safety_constraints: Dict,
                 admin: Dict):
        self.demographics = demographics
        self.disease_characteristics = disease_characteristic
        self.medical_history = medical_history
        self.prior_current_treatments = prior_current_treatments
        self.lab_values = lab_values
        self.functional_performance_status = functional_performance_status
        self.genetic_criteria = genetic_criteria
        self.reproductive_criteria = reproductive_criteria
        self.safety_constraints = safety_constraints
        self.admin = admin


class TrialEligibilityChecker:
    
    def __init__(self):
        self.evaluation_log = []
    
    def check_eligibility(self, 
                         patient_data: Dict[str, Any], 
                         trial_criteria: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Args:
            patient_data: Dictionary containing patient information
            trial_criteria: Dictionary containing trial inclusion/exclusion criteria
            
        Returns:
            Tuple of (is_eligible: bool, detailed_results: dict)
        """
        self.evaluation_log = []
        
        # Check inclusion criteria
        inclusion_passed = self._check_inclusion_criteria(
            patient_data, 
            trial_criteria.get('inclusion_criteria', {})
        )
        
        # Check exclusion criteria
        exclusion_passed = self._check_exclusion_criteria(
            patient_data,
            trial_criteria.get('exclusion_criteria', {})
        )
        
        # Patient qualifies only if they meet inclusion AND don't meet exclusion
        is_eligible = inclusion_passed and exclusion_passed
        
        results = {
            'eligible': is_eligible,
            'inclusion_criteria_met': inclusion_passed,
            'exclusion_criteria_met': exclusion_passed,
            'evaluation_details': self.evaluation_log,
            'timestamp': datetime.now().isoformat()
        }
        
        return is_eligible, results
    
    def _check_inclusion_criteria(self, patient_data: Dict, criteria: Dict) -> bool:
        """Check if patient meets all inclusion criteria"""
        if not criteria:
            self.evaluation_log.append({
                'type': 'inclusion',
                'status': 'passed',
                'message': 'No inclusion criteria specified'
            })
            return True
        
        all_passed = True
        
        # Age criteria
        if 'age_range' in criteria:
            passed = self._check_age_range(
                patient_data.get('age'),
                criteria['age_range']
            )
            all_passed = all_passed and passed
        
        # Diagnosis criteria
        if 'diagnoses' in criteria:
            passed = self._check_diagnoses(
                patient_data.get('diagnoses', []),
                criteria['diagnoses']
            )
            all_passed = all_passed and passed
        
        # Biomarker criteria
        if 'biomarkers' in criteria:
            passed = self._check_biomarkers(
                patient_data.get('biomarkers', {}),
                criteria['biomarkers']
            )
            all_passed = all_passed and passed
        
        # Performance status
        if 'performance_status' in criteria:
            passed = self._check_performance_status(
                patient_data.get('performance_status'),
                criteria['performance_status']
            )
            all_passed = all_passed and passed
        
        # Organ function
        if 'organ_function' in criteria:
            passed = self._check_organ_function(
                patient_data.get('lab_values', {}),
                criteria['organ_function']
            )
            all_passed = all_passed and passed
        
        return all_passed
    
    def _check_exclusion_criteria(self, patient_data: Dict, criteria: Dict) -> bool:
        """Check if patient meets any exclusion criteria (returns False if excluded)"""
        if not criteria:
            self.evaluation_log.append({
                'type': 'exclusion',
                'status': 'passed',
                'message': 'No exclusion criteria specified'
            })
            return True
        
        # Pregnancy
        if 'pregnancy' in criteria and criteria['pregnancy']:
            if patient_data.get('is_pregnant', False):
                self.evaluation_log.append({
                    'type': 'exclusion',
                    'status': 'failed',
                    'criterion': 'pregnancy',
                    'message': 'Patient is pregnant (exclusion criterion)'
                })
                return False
        
        # Prior treatments to exclude
        if 'prior_treatments' in criteria:
            patient_treatments = set(patient_data.get('prior_treatments', []))
            excluded_treatments = set(criteria['prior_treatments'])
            
            if patient_treatments.intersection(excluded_treatments):
                self.evaluation_log.append({
                    'type': 'exclusion',
                    'status': 'failed',
                    'criterion': 'prior_treatments',
                    'message': f'Patient has excluded prior treatment'
                })
                return False
        
        # Conditions to exclude
        if 'conditions' in criteria:
            patient_conditions = set(patient_data.get('conditions', []))
            excluded_conditions = set(criteria['conditions'])
            
            if patient_conditions.intersection(excluded_conditions):
                self.evaluation_log.append({
                    'type': 'exclusion',
                    'status': 'failed',
                    'criterion': 'conditions',
                    'message': f'Patient has excluded condition'
                })
                return False
        
        self.evaluation_log.append({
            'type': 'exclusion',
            'status': 'passed',
            'message': 'No exclusion criteria met'
        })
        return True
    
    def _check_age_range(self, patient_age: int, age_range: Dict) -> bool:
        """Check if patient age falls within required range"""
        min_age = age_range.get('min', 0)
        max_age = age_range.get('max', float('inf'))
        
        if patient_age is None:
            self.evaluation_log.append({
                'type': 'inclusion',
                'status': 'failed',
                'criterion': 'age',
                'message': 'Patient age not provided'
            })
            return False
        
        passed = min_age <= patient_age <= max_age
        
        self.evaluation_log.append({
            'type': 'inclusion',
            'status': 'passed' if passed else 'failed',
            'criterion': 'age',
            'message': f'Age {patient_age} {"within" if passed else "outside"} range {min_age}-{max_age}'
        })
        
        return passed
    
    def _check_diagnoses(self, patient_diagnoses: List[str], required_diagnoses: List[str]) -> bool:
        """Check if patient has required diagnoses"""
        patient_dx_set = set(d.lower() for d in patient_diagnoses)
        required_dx_set = set(d.lower() for d in required_diagnoses)
        
        # Patient must have at least one of the required diagnoses
        has_required = bool(patient_dx_set.intersection(required_dx_set))
        
        self.evaluation_log.append({
            'type': 'inclusion',
            'status': 'passed' if has_required else 'failed',
            'criterion': 'diagnoses',
            'message': f'Patient diagnoses {"match" if has_required else "do not match"} required diagnoses'
        })
        
        return has_required
    
    def _check_biomarkers(self, patient_biomarkers: Dict, required_biomarkers: Dict) -> bool:
        """Check if patient biomarkers meet requirements"""
        all_passed = True
        
        for marker, requirements in required_biomarkers.items():
            patient_value = patient_biomarkers.get(marker)
            
            if patient_value is None:
                self.evaluation_log.append({
                    'type': 'inclusion',
                    'status': 'failed',
                    'criterion': f'biomarker_{marker}',
                    'message': f'Biomarker {marker} not provided'
                })
                all_passed = False
                continue
            
            # Check if value meets requirements (e.g., "positive", ">50", etc.)
            if isinstance(requirements, str):
                passed = str(patient_value).lower() == requirements.lower()
            elif isinstance(requirements, dict):
                # Handle range requirements
                min_val = requirements.get('min', float('-inf'))
                max_val = requirements.get('max', float('inf'))
                passed = min_val <= float(patient_value) <= max_val
            else:
                passed = patient_value == requirements
            
            self.evaluation_log.append({
                'type': 'inclusion',
                'status': 'passed' if passed else 'failed',
                'criterion': f'biomarker_{marker}',
                'message': f'Biomarker {marker}: {patient_value} {"meets" if passed else "does not meet"} requirement'
            })
            
            all_passed = all_passed and passed
        
        return all_passed
    
    def _check_performance_status(self, patient_status: int, required_status: Dict) -> bool:
        """Check ECOG or Karnofsky performance status"""
        if patient_status is None:
            self.evaluation_log.append({
                'type': 'inclusion',
                'status': 'failed',
                'criterion': 'performance_status',
                'message': 'Performance status not provided'
            })
            return False
        
        max_allowed = required_status.get('max_ecog', 5)
        passed = patient_status <= max_allowed
        
        self.evaluation_log.append({
            'type': 'inclusion',
            'status': 'passed' if passed else 'failed',
            'criterion': 'performance_status',
            'message': f'ECOG {patient_status} {"≤" if passed else ">"} {max_allowed}'
        })
        
        return passed
    
    def _check_organ_function(self, lab_values: Dict, requirements: Dict) -> bool:
        """Check organ function labs (kidney, liver, etc.)"""
        all_passed = True
        
        for lab, req in requirements.items():
            patient_value = lab_values.get(lab)
            
            if patient_value is None:
                self.evaluation_log.append({
                    'type': 'inclusion',
                    'status': 'failed',
                    'criterion': f'lab_{lab}',
                    'message': f'Lab value {lab} not provided'
                })
                all_passed = False
                continue
            
            min_val = req.get('min', float('-inf'))
            max_val = req.get('max', float('inf'))
            passed = min_val <= patient_value <= max_val
            
            self.evaluation_log.append({
                'type': 'inclusion',
                'status': 'passed' if passed else 'failed',
                'criterion': f'lab_{lab}',
                'message': f'{lab}: {patient_value} (required: {min_val}-{max_val})'
            })
            
            all_passed = all_passed and passed
        
        return all_passed


# Example usage
if __name__ == "__main__":
    # Example patient data
    patient = {
        'age': 62,
        'diagnoses': ['non-small cell lung cancer', 'stage IV'],
        'biomarkers': {
            'PD-L1': 'positive',
            'EGFR': 'negative'
        },
        'performance_status': 1,  # ECOG scale
        'lab_values': {
            'creatinine': 1.2,
            'ALT': 45,
            'hemoglobin': 11.5
        },
        'is_pregnant': False,
        'prior_treatments': ['chemotherapy'],
        'conditions': ['hypertension']
    }
    
    # Example trial criteria
    trial = {
        'inclusion_criteria': {
            'age_range': {'min': 18, 'max': 75},
            'diagnoses': ['non-small cell lung cancer', 'NSCLC'],
            'biomarkers': {
                'PD-L1': 'positive'
            },
            'performance_status': {'max_ecog': 2},
            'organ_function': {
                'creatinine': {'min': 0, 'max': 1.5},
                'ALT': {'min': 0, 'max': 100},
                'hemoglobin': {'min': 9, 'max': 20}
            }
        },
        'exclusion_criteria': {
            'pregnancy': True,
            'prior_treatments': ['immunotherapy'],
            'conditions': ['active_infection', 'autoimmune_disease']
        }
    }
    
    # Run eligibility check
    checker = TrialEligibilityChecker()
    is_eligible, results = checker.check_eligibility(patient, trial)
    
    print(f"Patient Eligible: {is_eligible}")
    print(f"\nInclusion Criteria Met: {results['inclusion_criteria_met']}")
    print(f"Exclusion Criteria Met: {results['exclusion_criteria_met']}")
    print("\nDetailed Evaluation:")
    for detail in results['evaluation_details']:
        print(f"  - {detail}")