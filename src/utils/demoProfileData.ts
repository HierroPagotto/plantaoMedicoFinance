
import { Doctor } from '@/types/doctor';

export const createDemoProfile = () => {
  const demoProfile: Doctor = {
    personalInfo: {
      fullName: "Dr. João Silva",
      photoUrl: "https://randomuser.me/api/portraits/men/42.jpg",
      crm: "123456",
      crmState: "SP",
      graduationYear: "2010",
      city: "São Paulo",
      phone: "(11) 98765-4321",
      email: "joao.silva@exemplo.com.br"
    },
    specialties: {
      mainSpecialty: "Cardiologia",
      procedures: ["Intubação", "Sutura", "Punção", "Ventilação Mecânica"],
      shiftTypes: ["PS Adulto", "UTI", "Internação"]
    },
    availability: {
      preferredPeriods: ["Manhã", "Tarde", "12h"],
      preferredDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      acceptsFixedShifts: true,
      acceptsTemporaryShifts: true,
      maxDistanceKm: 30
    },
    location: {
      state: "SP",
      citiesOfWork: ["São Paulo", "Guarulhos", "Osasco", "Santo André"]
    },
    certifications: {
      acls: true,
      bls: true,
      atls: false,
      pals: true,
      others: "Certificação em Cardiologia Avançada"
    },
    experience: {
      mainHospitals: "Hospital Albert Einstein, Hospital Sírio Libanês, Hospital das Clínicas FMUSP",
      yearsOfExperience: "12"
    },
    additionalInfo: {
      hasDriverLicense: true,
      hasElectronicHealthRecordExperience: true,
      providesInvoice: true,
      languages: "Inglês (fluente), Espanhol (intermediário)"
    }
  };

  localStorage.setItem('doctorProfile', JSON.stringify(demoProfile));
  return demoProfile;
};
