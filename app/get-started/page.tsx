import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/constants/roles';

type Props = {
  searchParams: {
    role?: string;
  };
};

const VALID_ROLES = Object.values(ROLES);

export default function GetStartedPage({ searchParams }: Props) {
  const role = VALID_ROLES.includes(searchParams.role as typeof VALID_ROLES[number])
    ? searchParams.role
    : undefined;

  if (role) {
    redirect(`/login?mode=signup&role=${role}`);
  }

  redirect('/login?mode=signup');
}
