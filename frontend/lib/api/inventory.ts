import apiClient from './client';
import { RoomInventory } from '../types';

export const inventoryApi = {
    getByRoomType: async (roomTypeId: number, startDate: string, endDate: string) => {
        const { data } = await apiClient.get<RoomInventory[]>(
            `/api/Inventory/roomtype/${roomTypeId}`,
            { params: { startDate, endDate } }
        );
        return data;
    },

    updateAvailability: async (roomTypeId: number, date: string, availableRooms: number, price: number) => {
        const { data } = await apiClient.post('/api/Inventory/update', {
            roomTypeId,
            date,
            availableRooms,
            price,
        });
        return data;
    },

    generateInventory: async (roomTypeId: number, startDate: string, endDate: string) => {
        const { data } = await apiClient.post('/api/Inventory/generate', {
            roomTypeId,
            startDate,
            endDate,
        });
        return data;
    },
};