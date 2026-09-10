export type Profession =
  | 'doctor'
  | 'nurse'
  | 'nursing_technician'
  | 'orthopedic_technician';

export type CouncilType = 'CRM' | 'COREN' | 'CREFITO';

export const PROFESSIONS: {
  id: Profession;
  label: string;
  councilType: CouncilType;
}[] = [
    { id: 'doctor', label: 'Médico', councilType: 'CRM' },
    { id: 'nurse', label: 'Enfermeiro', councilType: 'COREN' },
    { id: 'nursing_technician', label: 'Técnico de enfermagem', councilType: 'COREN' },
    {
      id: 'orthopedic_technician',
      label: 'Técnico em ortopedia',
      councilType: 'CREFITO',
    },
  ];

export const OTHER_SPECIALTY = 'Outra';

export const SPECIALTIES_BY_PROFESSION: Record<Profession, string[]> = {
  doctor: [
    'Clínica médica',
    'Pediatria',
    'PS adulto',
    'PS infantil',
    'UTI adulto',
    'UTI pediátrica',
    'UTI neonatal',
    'Anestesiologia',
    'Cardiologia',
    'Cirurgia geral',
    'Geriatria',
    'Ginecologia e obstetrícia',
    'Medicina de família',
    'Medicina intensiva',
    'Neurologia',
    'Ortopedia',
    'Psiquiatria',
    'Radiologia',
    OTHER_SPECIALTY,
  ],
  nurse: [
    'Enfermagem geral',
    'UTI',
    'Pronto-socorro',
    'Centro cirúrgico',
    'Enfermaria',
    'Pediatria',
    'Neonatologia',
    'Obstetrícia',
    'Home care',
    OTHER_SPECIALTY,
  ],
  nursing_technician: [
    'Enfermagem geral',
    'UTI',
    'Pronto-socorro',
    'Centro cirúrgico',
    'Enfermaria',
    'Pediatria',
    'Ambulatório',
    OTHER_SPECIALTY,
  ],
  orthopedic_technician: [
    'Imobilizações ortopédicas',
    'Pronto-socorro',
    'Ambulatório ortopédico',
    'Centro cirúrgico',
    OTHER_SPECIALTY,
  ],
};

export const PRACTICE_AREAS = [
  'UTI adulto',
  'UTI pediátrica',
  'UTI neonatal',
  'Pronto-socorro adulto',
  'Pronto-socorro infantil',
  'Enfermaria',
  'Centro cirúrgico',
  'Ambulatório',
  'Home care',
  'Internação',
  'Telemedicina',
];

export function getProfessionMeta(profession?: string | null) {
  return PROFESSIONS.find((p) => p.id === profession) || PROFESSIONS[0];
}

export function councilLabel(profession?: string | null) {
  return getProfessionMeta(profession).councilType;
}

export function specialtiesFor(profession?: string | null) {
  const id = (profession as Profession) || 'doctor';
  return SPECIALTIES_BY_PROFESSION[id] || SPECIALTIES_BY_PROFESSION.doctor;
}

export function formatCouncilDisplay(profile: {
  council_type?: string | null;
  council_number?: string | null;
  council_state?: string | null;
  crm?: string | null;
  crm_state?: string | null;
  profession?: string | null;
}) {
  const type =
    profile.council_type ||
    (profile.crm ? 'CRM' : councilLabel(profile.profession));
  const number = profile.council_number || profile.crm;
  const state = profile.council_state || profile.crm_state;
  if (!number) return '';
  return `${type} ${number}${state ? `/${state}` : ''}`;
}
