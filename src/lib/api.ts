import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'https://api.medsinc.com.br/api';

export type AuthRole = 'doctor' | 'hospital_staff' | 'platform_admin';

export type LoginResponse = {
    token: string;
    role: AuthRole;
    name: string;
    email?: string;
    is_admin?: boolean;
    doctor_id?: number;
    staff_id?: number;
    hospital_id?: number;
    staff_role?: 'hospital_admin' | 'hospital_recruiter';
    hospital?: Record<string, unknown>;
    message?: string;
};

export type CreateHospitalOpportunityPayload = {
    date: string;
    start_time: string;
    end_time: string;
    specialty: string;
    required_profession: string;
    value: number;
    payment_date: string;
    city?: string;
    slots_total?: number;
    notes?: string;
    requires_acls?: boolean;
    requires_bls?: boolean;
    requires_atls?: boolean;
    requires_pals?: boolean;
};

class ApiClient {
    private api: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.token = localStorage.getItem('token');

        this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem('token') || this.token;
            if (token) {
                const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                config.headers.Authorization = value;
                this.token = token.replace(/^Bearer\s+/i, '');
            }
            return config;
        }, (error: AxiosError) => {
            return Promise.reject(error);
        });
    }

    isAuthenticated() {
        return !!this.token || !!localStorage.getItem('token');
    }

    private persistSession(data: LoginResponse) {
        localStorage.setItem('token', data.token);
        localStorage.setItem(
            'userData',
            JSON.stringify({
                name: data.name,
                email: data.email,
                role: data.role,
                is_admin: data.is_admin ?? false,
                doctor_id: data.doctor_id,
                staff_id: data.staff_id,
                hospital_id: data.hospital_id,
                staff_role: data.staff_role,
            })
        );
        this.token = data.token;
    }

    async uploadPhoto(file: File) {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await this.api.post('/doctors/upload-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async getPhoto(photoUrl: string) {
        const response = await this.api.get(photoUrl, {
            responseType: 'blob'
        });
        return response.data;
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await this.api.post('/login', { email, password });
        this.persistSession(response.data);
        return response.data;
    }

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        this.token = null;
    }

    async getAuthMe() {
        const response = await this.api.get('/auth/me');
        return response.data;
    }

    async registerHospital(payload: {
        hospital: {
            name: string;
            address: string;
            latitude: number;
            longitude: number;
            city?: string;
            state?: string;
            cnpj?: string;
        };
        admin: {
            name: string;
            email: string;
            password: string;
            phone?: string;
        };
    }): Promise<LoginResponse> {
        const response = await this.api.post('/auth/hospital/register', payload);
        this.persistSession(response.data);
        return response.data;
    }

    async getHospitalMe() {
        const response = await this.api.get('/hospital/me');
        return response.data;
    }

    async getHospitalStaff() {
        const response = await this.api.get('/hospital/staff');
        return response.data;
    }

    async createHospitalStaff(payload: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        staff_role?: 'hospital_admin' | 'hospital_recruiter';
    }) {
        const response = await this.api.post('/hospital/staff', payload);
        return response.data;
    }

    async deactivateHospitalStaff(staffId: number) {
        const response = await this.api.delete(`/hospital/staff/${staffId}`);
        return response.data;
    }

    async register(doctor: Record<string, unknown>) {
        const response = await this.api.post('/doctors', doctor);
        return response.data;
    }

    async createShift(shift: Record<string, unknown>) {
        const response = await this.api.post('/shifts', shift);
        return response.data;
    }

    async createHospital(hospital: Record<string, unknown>) {
        const response = await this.api.post('/hospitals', hospital);
        return response.data;
    }

    async getShifts() {
        const response = await this.api.get('/shifts');
        return response.data;
    }

    async getDashboard() {
        const response = await this.api.get('/shifts/dashboard');
        return response.data;
    }

    async getFinancial() {
        const response = await this.api.get('/shifts/financial');
        return response.data;
    }

    async getFinancialFull(year: number = 0) {
        const url = year > 0
            ? `/shifts/financial/full?year=${year}`
            : '/shifts/financial/full';
        const response = await this.api.get(url);
        return response.data;
    }

    async getMyData() {
        const response = await this.api.get('/doctors/me');
        return response.data;
    }

    async updateMyData(doctor: Record<string, unknown>) {
        const response = await this.api.put('/doctors/me', doctor);
        return response.data;
    }

    async getHospitals() {
        const response = await this.api.get('/hospitals');
        return response.data;
    }

    async getDoctor(id: number | string) {
        const response = await this.api.get(`/doctors/info/${id}`);
        return response.data;
    }

    async updateShiftStatus(shiftId: string | number, status: string) {
        if (status === 'completed') {
            return this.setShiftComplete(shiftId);
        } else if (status === 'canceled') {
            return this.setShiftCancelled(shiftId);
        } else if (status === 'paid') {
            return this.setShiftPaid(shiftId);
        }
        return false;
    }

    async setShiftComplete(shiftId: string | number) {
        const response = await this.api.post(`/shifts/${shiftId}/complete`);
        return response.data;
    }

    async setShiftCancelled(shiftId: string | number) {
        const response = await this.api.post(`/shifts/${shiftId}/cancelled`);
        return response.data;
    }

    async setShiftPaid(shiftId: string | number) {
        const response = await this.api.post(`/shifts/${shiftId}/paid`);
        return response.data;
    }

    async deleteShift(shiftId: string | number) {
        const response = await this.api.delete(`/shifts/${shiftId}`);
        return response.data;
    }

    async bulkDeleteShifts(ids: number[]) {
        const response = await this.api.delete('/shifts/bulk_delete', { data: { ids } });
        return response.data;
    }

    async getAdminUsers() {
        const response = await this.api.get('/admin/users');
        return response.data;
    }

    async deleteAdminUser(userId: string) {
        const response = await this.api.delete(`/admin/users/${userId}`);
        return response.data;
    }

    async getAdminHospitals() {
        const response = await this.api.get('/admin/hospitals');
        return response.data;
    }

    async deleteAdminHospital(hospitalId: string) {
        const response = await this.api.delete(`/admin/hospitals/${hospitalId}`);
        return response.data;
    }

    async updateShift(shiftId: string | number, data: Record<string, unknown>) {
        const response = await this.api.put(`/shifts/${shiftId}`, data);
        return response.data;
    }

    async requestPasswordReset(email: string) {
        const response = await this.api.post('/password-reset/request', { email });
        return response.data;
    }

    async verifyPasswordResetCode(email: string, code: string) {
        const response = await this.api.post('/password-reset/verify', { email, code });
        return response.data;
    }

    async changePassword(email: string, code: string, newPassword: string) {
        const response = await this.api.post('/password-reset/change', {
            email,
            code,
            new_password: newPassword
        });
        return response.data;
    }

    async getShiftById(id: string | undefined) {
        if (!id) throw new Error('ID não informado');
        const response = await this.api.get(`/shifts/${id}`);
        return response.data;
    }

    async getGoal(year: number, month: number) {
        const response = await this.api.get(`/shifts/goal?year=${year}&month=${month}`);
        return response.data;
    }
    async setGoal(year: number, month: number, value: number) {
        const response = await this.api.post('/shifts/goal', { year, month, value });
        return response.data;
    }
    async removeGoal(year: number, month: number) {
        const response = await this.api.delete(`/shifts/goal?year=${year}&month=${month}`);
        return response.data;
    }
    async listGoals() {
        const response = await this.api.get('/shifts/goals');
        return response.data;
    }

    async listMarketplaceOpportunities(params?: {
        city?: string;
        specialty?: string;
        date_from?: string;
        date_to?: string;
        verified_only?: boolean;
        page?: number;
        per_page?: number;
    }) {
        const response = await this.api.get('/marketplace/opportunities', { params });
        return response.data;
    }

    async getMarketplaceOpportunity(id: number | string) {
        const response = await this.api.get(`/marketplace/opportunities/${id}`);
        return response.data;
    }

    async applyToOpportunity(id: number | string, message?: string) {
        const response = await this.api.post(`/marketplace/opportunities/${id}/apply`, {
            message: message || undefined,
        });
        return response.data;
    }

    async listMyMarketplaceApplications() {
        const response = await this.api.get('/marketplace/applications/mine');
        return response.data;
    }

    async withdrawMarketplaceApplication(applicationId: number | string) {
        const response = await this.api.post(
            `/marketplace/applications/${applicationId}/withdraw`
        );
        return response.data;
    }

    async listHospitalOpportunities(status?: string) {
        const response = await this.api.get('/marketplace/opportunities/mine', {
            params: status ? { status } : undefined,
        });
        return response.data;
    }

    async createHospitalOpportunity(payload: CreateHospitalOpportunityPayload) {
        const response = await this.api.post('/marketplace/opportunities', payload);
        return response.data;
    }

    async updateHospitalOpportunity(
        id: number | string,
        payload: Partial<{
            date: string;
            start_time: string;
            end_time: string;
            specialty: string;
            required_profession: string;
            value: number;
            payment_date: string;
            city: string;
            slots_total: number;
            notes: string;
            requires_acls: boolean;
            requires_bls: boolean;
            requires_atls: boolean;
            requires_pals: boolean;
        }>
    ) {
        const response = await this.api.put(`/marketplace/opportunities/${id}`, payload);
        return response.data;
    }

    async cancelHospitalOpportunity(id: number | string) {
        const response = await this.api.post(`/marketplace/opportunities/${id}/cancel`);
        return response.data;
    }

    async listOpportunityApplications(opportunityId: number | string) {
        const response = await this.api.get(
            `/marketplace/opportunities/${opportunityId}/applications`
        );
        return response.data;
    }

    async approveMarketplaceApplication(applicationId: number | string) {
        const response = await this.api.post(
            `/marketplace/applications/${applicationId}/approve`
        );
        return response.data;
    }

    async rejectMarketplaceApplication(applicationId: number | string) {
        const response = await this.api.post(
            `/marketplace/applications/${applicationId}/reject`
        );
        return response.data;
    }

    async verifyAdminHospital(hospitalId: string | number) {
        const response = await this.api.post(`/admin/hospitals/${hospitalId}/verify`);
        return response.data;
    }

    async unverifyAdminHospital(hospitalId: string | number) {
        const response = await this.api.post(`/admin/hospitals/${hospitalId}/unverify`);
        return response.data;
    }

    async listAdminOpportunities(params?: { status?: string; page?: number; per_page?: number }) {
        const response = await this.api.get('/admin/opportunities', { params });
        return response.data;
    }

    async cancelAdminOpportunity(opportunityId: string | number) {
        const response = await this.api.post(`/admin/opportunities/${opportunityId}/cancel`);
        return response.data;
    }

    async listNotifications(params?: {
        page?: number;
        per_page?: number;
        unread_only?: boolean;
    }) {
        const response = await this.api.get('/notifications', { params });
        return response.data;
    }

    async getNotificationsUnreadCount() {
        const response = await this.api.get('/notifications/unread-count');
        return response.data;
    }

    async markNotificationRead(id: number | string) {
        const response = await this.api.post(`/notifications/${id}/read`);
        return response.data;
    }

    async markAllNotificationsRead() {
        const response = await this.api.post('/notifications/read-all');
        return response.data;
    }

    async getNotificationPreferences() {
        const response = await this.api.get('/notifications/preferences');
        return response.data;
    }

    async updateNotificationPreferences(payload: Record<string, boolean>) {
        const response = await this.api.put('/notifications/preferences', payload);
        return response.data;
    }
}

export const api = new ApiClient();
export default api;
