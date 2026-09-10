import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { knownMedicalSpecialties, OTHER_SPECIALTY } from "@/types/doctor"
import { specialtiesFor, type Profession } from "@/lib/professions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DoctorApiProfile = {
  name?: string | null
  photo_url?: string | null
  profession?: string | null
  council_number?: string | null
  council_state?: string | null
  crm?: string | null
  crm_state?: string | null
  graduation_year?: number | string | null
  city?: string | null
  phone?: string | null
  email?: string | null
  main_specialty?: string | null
  specialties?: string[] | null
  practice_areas?: string[] | null
  procedures?: string | null
  shift_types?: string | null
  preferred_periods?: string | null
  preferred_days?: string | null
  accepts_fixed_shifts?: boolean | null
  accepts_temporary_shifts?: boolean | null
  max_distance_km?: number | string | null
  state?: string | null
  cities_of_work?: string | null
  acls?: boolean | null
  bls?: boolean | null
  atls?: boolean | null
  pals?: boolean | null
  other_certifications?: string | null
  main_hospitals?: string | null
  years_of_experience?: string | null
  has_driver_license?: boolean | null
  has_ehr_experience?: boolean | null
  provides_invoice?: boolean | null
  languages?: string | null
}

export type DoctorRegistrationFormValues = {
  profession?: Profession
  councilType?: string
  personalInfo: {
    fullName: string
    photoUrl?: string
    crm: string
    crmState: string
    graduationYear: number
    city: string
    phone: string
    email: string
  }
  specialties: {
    mainSpecialty?: string
    customSpecialty?: string
    selectedSpecialties?: string[]
    practiceAreas?: string[]
    procedures: string[]
    shiftTypes: string[]
  }
  availability: {
    preferredPeriods: string[]
    preferredDays: string[]
    acceptsFixedShifts: boolean
    acceptsTemporaryShifts: boolean
    maxDistanceKm: number
  }
  location: {
    state: string
    citiesOfWork: string[]
  }
  certifications: {
    acls: boolean
    bls: boolean
    atls: boolean
    pals: boolean
    others?: string
  }
  experience: {
    mainHospitals?: string
    yearsOfExperience?: string
  }
  additionalInfo: {
    hasDriverLicense: boolean
    hasElectronicHealthRecordExperience: boolean
    providesInvoice: boolean
    languages?: string
  }
}

export type DoctorApiUpdatePayload = {
  name: string
  photo_url?: string
  profession: string
  council_type: string
  council_number: string
  council_state: string
  crm: string | null
  crm_state: string | null
  graduation_year: number
  city: string
  phone: string
  email: string
  main_specialty: string
  specialties: string[]
  practice_areas: string[]
  procedures: string
  shift_types: string
  preferred_periods: string
  preferred_days: string
  accepts_fixed_shifts: boolean
  accepts_temporary_shifts: boolean
  max_distance_km: number
  state: string
  cities_of_work: string
  acls: boolean
  bls: boolean
  atls: boolean
  pals: boolean
  other_certifications?: string
  main_hospitals?: string
  years_of_experience?: string
  has_driver_license: boolean
  has_ehr_experience: boolean
  provides_invoice: boolean
  languages?: string
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(",").map((part) => part.trim()).filter(Boolean)
}

function resolveSpecialtyFromApi(
  mainSpecialty: string | null | undefined,
  profession?: string | null
) {
  const specialty = (mainSpecialty || "").trim()
  const known = specialtiesFor(profession).filter((s) => s !== OTHER_SPECIALTY)
  if (!specialty) {
    return { mainSpecialty: "", customSpecialty: "" }
  }
  if (known.includes(specialty) || knownMedicalSpecialties.includes(specialty)) {
    return { mainSpecialty: specialty, customSpecialty: "" }
  }
  return { mainSpecialty: OTHER_SPECIALTY, customSpecialty: specialty }
}

export function transformApiToForm(
  data: DoctorApiProfile
): DoctorRegistrationFormValues {
  const profession = (data.profession || "doctor") as Profession
  const specialtiesList: string[] = Array.isArray(data.specialties)
    ? data.specialties.filter(Boolean)
    : []
  if (!specialtiesList.length && data.main_specialty) {
    specialtiesList.push(data.main_specialty)
  }

  const known = specialtiesFor(profession).filter((s) => s !== OTHER_SPECIALTY)
  const selectedSpecialties = specialtiesList.filter((s) => known.includes(s))
  const customFromList = specialtiesList.find((s) => !known.includes(s)) || ""
  const { mainSpecialty, customSpecialty } = resolveSpecialtyFromApi(
    specialtiesList[0] || data.main_specialty,
    profession
  )

  return {
    profession,
    personalInfo: {
      fullName: data.name || "",
      photoUrl: data.photo_url || "",
      crm: data.council_number || data.crm || "",
      crmState: data.council_state || data.crm_state || "",
      graduationYear: Number(data.graduation_year) || new Date().getFullYear(),
      city: data.city || "",
      phone: data.phone || "",
      email: data.email || "",
    },
    specialties: {
      mainSpecialty,
      customSpecialty: customSpecialty || customFromList,
      selectedSpecialties:
        selectedSpecialties.length > 0
          ? selectedSpecialties
          : mainSpecialty && mainSpecialty !== OTHER_SPECIALTY
            ? [mainSpecialty]
            : [],
      practiceAreas: Array.isArray(data.practice_areas) ? data.practice_areas : [],
      procedures: splitCsv(data.procedures),
      shiftTypes: splitCsv(data.shift_types),
    },
    availability: {
      preferredPeriods: splitCsv(data.preferred_periods),
      preferredDays: splitCsv(data.preferred_days),
      acceptsFixedShifts: data.accepts_fixed_shifts ?? false,
      acceptsTemporaryShifts: data.accepts_temporary_shifts ?? false,
      maxDistanceKm: Number.isFinite(Number(data.max_distance_km))
        ? Number(data.max_distance_km)
        : 50,
    },
    location: {
      state: data.state || "",
      citiesOfWork: splitCsv(data.cities_of_work),
    },
    certifications: {
      acls: data.acls ?? false,
      bls: data.bls ?? false,
      atls: data.atls ?? false,
      pals: data.pals ?? false,
      others: data.other_certifications || "",
    },
    experience: {
      mainHospitals: data.main_hospitals || "",
      yearsOfExperience: data.years_of_experience || "",
    },
    additionalInfo: {
      hasDriverLicense: data.has_driver_license ?? false,
      hasElectronicHealthRecordExperience: data.has_ehr_experience ?? false,
      providesInvoice: data.provides_invoice ?? false,
      languages: data.languages || "",
    },
  }
}

export function transformFormToApi(
  values: DoctorRegistrationFormValues
): DoctorApiUpdatePayload {
  const profession = values.profession || "doctor"
  const selected: string[] = Array.isArray(values.specialties.selectedSpecialties)
    ? [...values.specialties.selectedSpecialties]
    : []
  const custom = (values.specialties.customSpecialty || "").trim()
  if (custom) {
    selected.push(custom)
  }
  if (
    !selected.length &&
    values.specialties.mainSpecialty &&
    values.specialties.mainSpecialty !== OTHER_SPECIALTY
  ) {
    selected.push(values.specialties.mainSpecialty)
  }

  const mainSpecialty = selected[0] || ""
  const councilType =
    values.councilType ||
    (profession === "doctor"
      ? "CRM"
      : profession === "orthopedic_technician"
        ? "CREFITO"
        : "COREN")

  return {
    name: values.personalInfo.fullName,
    photo_url: values.personalInfo.photoUrl,
    profession,
    council_type: councilType,
    council_number: values.personalInfo.crm,
    council_state: values.personalInfo.crmState,
    crm: councilType === "CRM" ? values.personalInfo.crm : null,
    crm_state: councilType === "CRM" ? values.personalInfo.crmState : null,
    graduation_year: values.personalInfo.graduationYear,
    city: values.personalInfo.city,
    phone: values.personalInfo.phone,
    email: values.personalInfo.email,
    main_specialty: mainSpecialty,
    specialties: selected,
    practice_areas: values.specialties.practiceAreas || [],
    procedures: values.specialties.procedures.join(", "),
    shift_types: values.specialties.shiftTypes.join(", "),
    preferred_periods: values.availability.preferredPeriods.join(", "),
    preferred_days: values.availability.preferredDays.join(", "),
    accepts_fixed_shifts: values.availability.acceptsFixedShifts,
    accepts_temporary_shifts: values.availability.acceptsTemporaryShifts,
    max_distance_km: values.availability.maxDistanceKm,
    state: values.location.state,
    cities_of_work: values.location.citiesOfWork.join(", "),
    acls: values.certifications.acls,
    bls: values.certifications.bls,
    atls: values.certifications.atls,
    pals: values.certifications.pals,
    other_certifications: values.certifications.others,
    main_hospitals: values.experience.mainHospitals,
    years_of_experience: values.experience.yearsOfExperience,
    has_driver_license: values.additionalInfo.hasDriverLicense,
    has_ehr_experience: values.additionalInfo.hasElectronicHealthRecordExperience,
    provides_invoice: values.additionalInfo.providesInvoice,
    languages: values.additionalInfo.languages,
  }
}
