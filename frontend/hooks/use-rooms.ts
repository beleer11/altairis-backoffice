"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomTypesApi } from "@/lib/api/rooms";
import { RoomType, UpdateInventoryRequest, GenerateInventoryRequest } from "@/lib/types";
import { toast } from "sonner";
import { inventoryApi } from "@/lib/api/inventory";

// Room Types Hooks
export function useRoomTypes() {
    return useQuery({
        queryKey: ["roomTypes"],
        queryFn: () => roomTypesApi.getAll(),
    });
}

export function useRoomType(id: number) {
    return useQuery({
        queryKey: ["roomType", id],
        queryFn: () => roomTypesApi.getById(id),
        enabled: !!id,
    });
}

export function useRoomTypesByHotel(hotelId: number) {
    return useQuery({
        queryKey: ["roomTypes", "hotel", hotelId],
        queryFn: () => roomTypesApi.getByHotel(hotelId),
        enabled: !!hotelId,
    });
}

export function useCreateRoomType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roomType: Omit<RoomType, "id">) => roomTypesApi.create(roomType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
            toast.success("Tipo de habitación creado correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al crear el tipo de habitación");
        },
    });
}

export function useUpdateRoomType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<RoomType> }) =>
            roomTypesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
            queryClient.invalidateQueries({ queryKey: ["roomType", variables.id] });
            toast.success("Tipo de habitación actualizado correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al actualizar el tipo de habitación");
        },
    });
}

export function useDeleteRoomType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => roomTypesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
            toast.success("Tipo de habitación eliminado correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al eliminar el tipo de habitación");
        },
    });
}

// Inventory Hooks
export function useInventory(roomTypeId: number, startDate: string, endDate: string) {
    return useQuery({
        queryKey: ["inventory", roomTypeId, startDate, endDate],
        queryFn: () => inventoryApi.getByRoomType(roomTypeId, startDate, endDate),
        enabled: !!(roomTypeId && startDate && endDate),
    });
}