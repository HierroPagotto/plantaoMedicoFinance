
export interface Doctor {
  personalInfo: {
    fullName: string;
    photoUrl?: string;
    crm: string;
    crmState: string;
    graduationYear: number;
    city: string;
    phone: string;
    email: string;
  };
  specialties: {
    mainSpecialty: string;
    procedures: string[];
    shiftTypes: string[];
  };
  availability: {
    preferredPeriods: string[];
    preferredDays: string[];
    acceptsFixedShifts: boolean;
    acceptsTemporaryShifts: boolean;
    maxDistanceKm: number;
  };
  location: {
    state: string;
    citiesOfWork: string[];
  };
  certifications: {
    acls: boolean;
    bls: boolean;
    atls: boolean;
    pals: boolean;
    others: string;
  };
  experience: {
    mainHospitals: string;
    yearsOfExperience: string;
  };
  additionalInfo: {
    hasDriverLicense: boolean;
    hasElectronicHealthRecordExperience: boolean;
    providesInvoice: boolean;
    languages: string;
  };
}

export const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export const OTHER_SPECIALTY = "Outra";

export const medicalSpecialties = [
  "Clínica médica",
  "Pediatria",
  "PS adulto",
  "PS infantil",
  "UTI adulto",
  "UTI pediátrica",
  "UTI neonatal",
  "Anestesiologia",
  "Cardiologia",
  "Cirurgia geral",
  "Geriatria",
  "Ginecologia e obstetrícia",
  "Medicina de família",
  "Medicina intensiva",
  "Neurologia",
  "Ortopedia",
  "Psiquiatria",
  "Radiologia",
  OTHER_SPECIALTY,
];

export const knownMedicalSpecialties = medicalSpecialties.filter(
  (s) => s !== OTHER_SPECIALTY
);

export const procedures = [
  "Intubação",
  "Sutura",
  "Punção venosa central",
  "Punção arterial",
  "Ventilação mecânica",
  "Drenagem torácica",
  "Toracocentese",
  "Paracentese",
  "Pequenas cirurgias",
  "Ressuscitação cardiopulmonar",
  "Cardioversão",
];

export const shiftTypes = [
  "PS adulto",
  "PS infantil",
  "UTI adulto",
  "UTI pediátrica",
  "UTI neonatal",
  "Internação",
  "Centro cirúrgico",
  "Telemedicina",
  "Home care",
];

export const periods = [
  "Manhã (6h)",
  "Tarde (6h)",
  "Noite (12h)",
  "12 horas",
  "24 horas",
  "Outros",
];

export const weekDays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
  "Feriados",
];
