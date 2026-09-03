export type DoctorProfileLike = {
  crm?: string | null;
  crm_state?: string | null;
  phone?: string | null;
  city?: string | null;
  main_specialty?: string | null;
  role?: string;
};

export function isDoctorProfileComplete(
  doctor: DoctorProfileLike | null | undefined
): boolean {
  if (!doctor) return false;

  const required = [
    doctor.crm,
    doctor.crm_state,
    doctor.phone,
    doctor.city,
    doctor.main_specialty,
  ];

  return required.every((value) => String(value ?? "").trim().length > 0);
}

export const DOCTOR_PROFILE_SETUP_PATH = "/doctor-registration";
