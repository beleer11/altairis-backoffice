"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelsApi, HotelSearchParams } from "@/lib/api/hotels";
import { Hotel } from "@/lib/types";
import { toast } from "sonner";

export function useHotels(page = 1, pageSize = 20) {
    return useQuery({
        queryKey: ["hotels", page, pageSize],
        queryFn: () => hotelsApi.getAll(page, pageSize),
    });
}

export function useHotel(id: number) {
    return useQuery({
        queryKey: ["hotel", id],
        queryFn: () => hotelsApi.getById(id),
        enabled: !!id,
    });
}

export function useSearchHotels(params: HotelSearchParams) {
    return useQuery({
        queryKey: ["hotels", "search", params],
        queryFn: () => hotelsApi.search(params),
        enabled: !!(params.name || params.city || params.country || params.minRating),
    });
}

export function useCreateHotel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (hotel: Omit<Hotel, "id" | "createdAt">) =>
            hotelsApi.create(hotel),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            toast.success("Hotel creado correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al crear el hotel");
        },
    });
}

export function useUpdateHotel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Hotel> }) =>
            hotelsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            queryClient.invalidateQueries({ queryKey: ["hotel", variables.id] });
            toast.success("Hotel actualizado correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al actualizar el hotel");
        },
    });
}

export function useDeleteHotel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => hotelsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            toast.success("Hotel eliminado correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al eliminar el hotel");
        },
    });
}