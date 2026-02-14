import apiClient from './client';
import { Hotel, PaginatedResponse } from '../types';

export interface HotelSearchParams {
    name?: string;
    city?: string;
    country?: string;
    minRating?: number;
}

export const hotelsApi = {
    // GET /api/Hotels
    getAll: async (page = 1, pageSize = 20) => {
        const { data } = await apiClient.get<PaginatedResponse<Hotel>>('/api/Hotels', {
            params: { page, pageSize },
        });
        return data;
    },

    // GET /api/Hotels/{id}
    getById: async (id: number) => {
        const { data } = await apiClient.get<Hotel>(`/api/Hotels/${id}`);
        return data;
    },

    // POST /api/Hotels
    create: async (hotel: Omit<Hotel, 'id' | 'createdAt'>) => {
        const { data } = await apiClient.post<Hotel>('/api/Hotels', hotel);
        return data;
    },

    // PUT /api/Hotels/{id}
    update: async (id: number, hotel: Partial<Hotel>) => {
        const { data } = await apiClient.put<Hotel>(`/api/Hotels/${id}`, hotel);
        return data;
    },

    // DELETE /api/Hotels/{id}
    delete: async (id: number) => {
        await apiClient.delete(`/api/Hotels/${id}`);
    },

    // GET /api/Hotels/search
    search: async (params: HotelSearchParams) => {
        const { data } = await apiClient.get<Hotel[]>('/api/Hotels/search', {
            params,
        });
        return data;
    },
};