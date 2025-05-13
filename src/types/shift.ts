export interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Shift {
  id: number;
  doctor_id: number;
  hospital_id: number;
  date: string;
  start_time: string;
  end_time: string;
  value: number;
  status: 'scheduled' | 'completed' | 'paid' | 'canceled';
  payment_date: string;
  specialty: string;
  hospital: Hospital;
  created_at: string;
  updated_at: string;
}