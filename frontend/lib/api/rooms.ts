import apiClient from './client';
import { RoomType } from '../types';

export const roomTypesApi = {
    // GET /api/RoomTypes
    getAll: async () => {
        const { data } = await apiClient.get<RoomType[]>('/api/RoomTypes');
        return data;
    },

    // GET /api/RoomTypes/{id}
    getById: async (id: number) => {
        const { data } = await apiClient.get<RoomType>(`/api/RoomTypes/${id}`);
        return data;
    },

    // POST /api/RoomTypes
    create: async (roomType: Omit<RoomType, 'id'>) => {
        const { data } = await apiClient.post<RoomType>('/api/RoomTypes', roomType);
        return data;
    },

    // PUT /api/RoomTypes/{id}
    update: async (id: number, roomType: Partial<RoomType>) => {
        const { data } = await apiClient.put<RoomType>(`/api/RoomTypes/${id}`, roomType);
        return data;
    },

    // DELETE /api/RoomTypes/{id}
    delete: async (id: number) => {
        await apiClient.delete(`/api/RoomTypes/${id}`);
    },

    // GET /api/RoomTypes/hotel/{hotelId}
    getByHotel: async (hotelId: number) => {
        const { data } = await apiClient.get<RoomType[]>(`/api/RoomTypes/hotel/${hotelId}`);
        return data;
    },
};
