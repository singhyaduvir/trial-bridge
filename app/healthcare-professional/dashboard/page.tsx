import { redirect } from 'next/navigation';

export default function HealthcareProfessionalDashboard() {
  redirect('/login?mode=signup&role=healthcare-professional');
}
