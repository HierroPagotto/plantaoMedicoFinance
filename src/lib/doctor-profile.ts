import { councilLabel } from '@/lib/professions';

export type DoctorProfileLike = {
  profession?: string | null;
  council_type?: string | null;
  council_number?: string | null;
  council_state?: string | null;
  crm?: string | null;
  crm_state?: string | null;
  phone?: string | null;
  city?: string | null;
  main_specialty?: string | null;
  specialties?: string[] | null;
  practice_areas?: string[] | null;
  role?: string;
};

export function isDoctorProfileComplete(
  doctor: DoctorProfileLike | null | undefined
): boolean {
  if (!doctor) return false;

  const councilNumber = doctor.council_number || doctor.crm;
  const councilState = doctor.council_state || doctor.crm_state;
  const specialty =
    (doctor.specialties && doctor.specialties[0]) || doctor.main_specialty;
  const required = [
    councilNumber,
    councilState,
    doctor.phone,
    doctor.city,
    specialty,
  ];

  return required.every((value) => String(value ?? '').trim().length > 0);
}

export function expectedCouncilType(doctor: DoctorProfileLike | null | undefined) {
  return doctor?.council_type || councilLabel(doctor?.profession);
}

export const DOCTOR_PROFILE_SETUP_PATH = '/doctor-registration';
