import apiClient from './client';
import { Booking, BookingStatus, PaginatedResponse } from '../types';

export const bookingsApi = {
    // GET /api/Bookings
    getAll: async (page = 1, pageSize = 20) => {
        const { data } = await apiClient.get<PaginatedResponse<Booking>>('/api/Bookings', {
            params: { page, pageSize },
        });
        return data;
    },

    // GET /api/Bookings/{id}
    getById: async (id: number) => {
        const { data } = await apiClient.get<Booking>(`/api/Bookings/${id}`);
        return data;
    },

    // POST /api/Bookings
    create: async (booking: Omit<Booking, 'id' | 'bookingReference' | 'createdAt'>) => {
        const { data } = await apiClient.post<Booking>('/api/Bookings', booking);
        return data;
    },

    // PUT /api/Bookings/{id}
    update: async (id: number, booking: Partial<Booking>) => {
        const { data } = await apiClient.put<Booking>(`/api/Bookings/${id}`, booking);
        return data;
    },

    // DELETE /api/Bookings/{id}
    delete: async (id: number) => {
        await apiClient.delete(`/api/Bookings/${id}`);
    },

    // GET /api/Bookings/reference/{reference}
    getByReference: async (reference: string) => {
        const { data } = await apiClient.get<Booking>(`/api/Bookings/reference/${reference}`);
        return data;
    },

    // GET /api/Bookings/email/{email}
    getByEmail: async (email: string) => {
        const { data } = await apiClient.get<Booking[]>(`/api/Bookings/email/${email}`);
        return data;
    },

    // GET /api/Bookings/date-range
    getByDateRange: async (startDate: string, endDate: string) => {
        const { data } = await apiClient.get<Booking[]>('/api/Bookings/date-range', {
            params: { startDate, endDate },
        });
        return data;
    },

    // GET /api/Bookings/occupancy/{hotelId}
    getOccupancy: async (hotelId: number, startDate: string, endDate: string) => {
        const { data } = await apiClient.get(`/api/Bookings/occupancy/${hotelId}`, {
            params: { startDate, endDate },
        });
        return data;
    },

    // GET /api/Bookings/revenue
    getRevenue: async (startDate: string, endDate: string) => {
        const { data } = await apiClient.get<number>('/api/Bookings/revenue', {
            params: { startDate, endDate },
        });
        return data;
    },

    updateStatus: async (id: number, status: BookingStatus) => {
        const { data } = await apiClient.patch(`/api/Bookings/${id}/status`, { status });
        return data;
    },
};