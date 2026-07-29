import { supabase } from '@/lib/supabase/client';
import type { Role } from '@/lib/constants/roles';

export type AuthUserMetadata = {
  role?: Role;
  patientType?: string;
};

export async function signUpWithRole(
  email: string,
  password: string,
  role: Role,
  patientType?: string,
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...(patientType ? { patientType } : {}),
      },
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUserProfile() {
  return await supabase.auth.getUser();
}

export async function updateUserMetadata(metadata: AuthUserMetadata) {
  return await supabase.auth.updateUser({ data: metadata });
}
