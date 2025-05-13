import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformApiToForm(data: any): any {
  return {
    personalInfo: {
      fullName: data.name || "",
      photoUrl: data.photo_url || "",
      crm: data.crm || "",
      crmState: data.crm_state || "",
      graduationYear: Number(data.graduation_year) || new Date().getFullYear(),
      city: data.city || "",
      phone: data.phone || "",
      email: data.email || "",
    },
    specialties: {
      mainSpecialty: data.main_specialty || "",
      procedures: data.procedures ? data.procedures.split(",").map(p => p.trim()) : [],
      shiftTypes: data.shift_types ? data.shift_types.split(",").map(s => s.trim()) : [],
    },
    availability: {
      preferredPeriods: data.preferred_periods ? data.preferred_periods.split(",").map(p => p.trim()) : [],
      preferredDays: data.preferred_days ? data.preferred_days.split(",").map(d => d.trim()) : [],
      acceptsFixedShifts: data.accepts_fixed_shifts ?? false,
      acceptsTemporaryShifts: data.accepts_temporary_shifts ?? false,
      maxDistanceKm: Number(data.max_distance_km) ?? 50,
    },
    location: {
      state: data.state || "",
      citiesOfWork: data.cities_of_work
        ? data.cities_of_work.split(",").map(c => c.trim())
        : [],
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
  };
}

export function transformFormToApi(values: any): any {
  return {
    name: values.personalInfo.fullName,
    photo_url: values.personalInfo.photoUrl,
    crm: values.personalInfo.crm,
    crm_state: values.personalInfo.crmState,
    graduation_year: values.personalInfo.graduationYear,
    city: values.personalInfo.city,
    phone: values.personalInfo.phone,
    email: values.personalInfo.email,
    main_specialty: values.specialties.mainSpecialty,
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
  };
}
