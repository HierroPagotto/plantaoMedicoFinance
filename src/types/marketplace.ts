export type OpportunityStatus = 'open' | 'filled' | 'cancelled';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export type MarketplaceHospital = {
  id: number;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  latitude?: number;
  longitude?: number;
};

export type ShiftOpportunity = {
  id: number;
  hospital_id: number;
  created_by_staff_id: number;
  date: string;
  start_time: string;
  end_time: string;
  specialty: string;
  required_profession?: string;
  value: number;
  payment_date?: string | null;
  requires_acls?: boolean;
  requires_bls?: boolean;
  requires_atls?: boolean;
  requires_pals?: boolean;
  city?: string | null;
  slots_total: number;
  slots_filled: number;
  slots_remaining: number;
  status: OpportunityStatus;
  notes?: string | null;
  hospital?: MarketplaceHospital;
  applications_count?: number;
  pending_applications_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type OpportunityApplication = {
  id: number;
  opportunity_id: number;
  doctor_id: number;
  status: ApplicationStatus;
  message?: string | null;
  reviewed_by_staff_id?: number | null;
  reviewed_at?: string | null;
  created_at?: string;
  opportunity?: ShiftOpportunity;
  doctor?: {
    id: number;
    name: string;
    profession?: string;
    council_type?: string;
    council_number?: string;
    council_state?: string;
    crm?: string;
    crm_state?: string;
    main_specialty?: string;
    specialties?: string[];
    practice_areas?: string[];
    city?: string;
    state?: string;
    photo_url?: string;
    acls?: boolean;
    bls?: boolean;
    atls?: boolean;
    pals?: boolean;
    years_of_experience?: string;
  };
};
