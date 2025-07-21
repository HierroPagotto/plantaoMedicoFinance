import axios from 'axios';
import { getShiftById } from './api';

class ApiClient {
    private api: any;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: 'https://api.medsinc.com.br/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.token = localStorage.getItem('token');

        this.api.interceptors.request.use((config: any) => {
            const token = localStorage.getItem('token') || this.token;
            if (token) {
                config.headers.Authorization = token;
                this.token = token;
            }
            return config;
        }, (error: any) => {
            return Promise.reject(error);
        });
    }

    isAuthenticated() {
        return !!this.token;
    }

    async uploadPhoto(file: File) {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await this.api.post('/doctors/upload-photo', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        });
        return response.data;
    }

    async getPhoto(photoUrl: string) {
        const response = await this.api.get(photoUrl, {
            responseType: 'blob'
        });
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await this.api.post('/login', { email, password });
        localStorage.setItem('token', response.data.token);
        this.token = response.data.token;
        return response.data.token;
    }

    async logout() {
        localStorage.removeItem('token');
        this.token = null;
    }

    async register(doctor: any) {
        const response = await this.api.post('/doctors', doctor);
        return response.data;
    }

    async createShift(shift: any) {
        const response = await this.api.post('/shifts', shift);
        return response.data;
    }

    async createHospital(hospital: any) {
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

    async updateMyData(doctor: any) {
        const response = await this.api.put('/doctors/me', doctor);
        return response.data;
    }

    async getHospitals() {
        const response = await this.api.get('/hospitals');
        return response.data;
    }

    async getDoctor(id: number|string) {
        const response = await this.api.get(`/doctors/info/${id}`);
        return response.data;
    }

    async updateShiftStatus(shiftId: any, status: string) {
        if (status === 'completed') {
            return this.setShiftComplete(shiftId);
        } else if (status === 'canceled') {
            return this.setShiftCancelled(shiftId);
        } else if (status === 'paid') {
            return this.setShiftPaid(shiftId);
        }
        return false;
    }

    async setShiftComplete(shiftId: any) {
        const response = await this.api.post(`/shifts/${shiftId}/complete`);
        return response.data;
    }

    async setShiftCancelled(shiftId: any) {
        const response = await this.api.post(`/shifts/${shiftId}/cancelled`);
        return response.data;
    }

    async setShiftPaid(shiftId: any) {
        const response = await this.api.post(`/shifts/${shiftId}/paid`);
        return response.data;
    }

    async deleteShift(shiftId: any) {
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

    async updateShift(shiftId: string | number, data: any) {
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
        const res = await fetch(`/api/shifts/${id}`);
        if (!res.ok) throw new Error('Erro ao buscar plantão');
        return await res.json();
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
}

export const api = new ApiClient();
export default api;