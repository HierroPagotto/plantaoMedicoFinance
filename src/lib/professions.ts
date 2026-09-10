export type Profession = 'doctor' | 'nurse' | 'technician';

export type CouncilType = 'CRM' | 'COREN' | 'CREFITO';

export const PROFESSIONS: {
  id: Profession;
  label: string;
  councilType: CouncilType;
  allowedCouncils: CouncilType[];
}[] = [
  { id: 'doctor', label: 'Médico', councilType: 'CRM', allowedCouncils: ['CRM'] },
  { id: 'nurse', label: 'Enfermeiro', councilType: 'COREN', allowedCouncils: ['COREN'] },
  {
    id: 'technician',
    label: 'Técnico',
    councilType: 'COREN',
    allowedCouncils: ['COREN', 'CREFITO'],
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
  technician: [
    'Técnico de enfermagem',
    'Técnico em ortopedia',
    'Técnico em radiologia',
    'Técnico em laboratório',
    'UTI',
    'Pronto-socorro',
    'Centro cirúrgico',
    'Enfermaria',
    'Ambulatório',
    'Imobilizações ortopédicas',
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

const LEGACY_PROFESSION_MAP: Record<string, Profession> = {
  nursing_technician: 'technician',
  orthopedic_technician: 'technician',
};

export function normalizeProfession(profession?: string | null): Profession {
  if (!profession) return 'doctor';
  const mapped = LEGACY_PROFESSION_MAP[profession] || profession;
  if (mapped === 'nurse' || mapped === 'technician' || mapped === 'doctor') {
    return mapped;
  }
  return 'doctor';
}

export function getProfessionMeta(profession?: string | null) {
  const id = normalizeProfession(profession);
  return PROFESSIONS.find((p) => p.id === id) || PROFESSIONS[0];
}

export function councilLabel(profession?: string | null) {
  return getProfessionMeta(profession).councilType;
}

export function allowedCouncilsFor(profession?: string | null): CouncilType[] {
  return getProfessionMeta(profession).allowedCouncils;
}

/** Heurística: especialidade de ortopedia → CREFITO; demais técnicos → COREN. */
export function suggestCouncilForSpecialty(
  profession?: string | null,
  specialty?: string | null
): CouncilType {
  const meta = getProfessionMeta(profession);
  if (meta.id !== 'technician') return meta.councilType;
  const text = (specialty || '').toLowerCase();
  if (text.includes('ortoped') || text.includes('imobiliza')) {
    return 'CREFITO';
  }
  return 'COREN';
}

export function specialtiesFor(profession?: string | null) {
  const id = normalizeProfession(profession);
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
