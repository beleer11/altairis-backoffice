"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import { Booking, BookingStatus } from "@/lib/types";
import { toast } from "sonner";

export function useBookings(page = 1, pageSize = 20) {
    return useQuery({
        queryKey: ["bookings", page, pageSize],
        queryFn: () => bookingsApi.getAll(page, pageSize),
    });
}

export function useBooking(id: number) {
    return useQuery({
        queryKey: ["booking", id],
        queryFn: () => bookingsApi.getById(id),
        enabled: !!id,
    });
}

export function useBookingByReference(reference: string) {
    return useQuery({
        queryKey: ["booking", "reference", reference],
        queryFn: () => bookingsApi.getByReference(reference),
        enabled: !!reference,
    });
}

export function useBookingsByEmail(email: string) {
    return useQuery({
        queryKey: ["bookings", "email", email],
        queryFn: () => bookingsApi.getByEmail(email),
        enabled: !!email,
    });
}

export function useBookingsByDateRange(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ["bookings", "dateRange", startDate, endDate],
        queryFn: () => bookingsApi.getByDateRange(startDate, endDate),
        enabled: !!(startDate && endDate),
    });
}

export function useOccupancy(hotelId: number, startDate: string, endDate: string) {
    return useQuery({
        queryKey: ["occupancy", hotelId, startDate, endDate],
        queryFn: () => bookingsApi.getOccupancy(hotelId, startDate, endDate),
        enabled: !!(hotelId && startDate && endDate),
    });
}

export function useRevenue(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ["revenue", startDate, endDate],
        queryFn: () => bookingsApi.getRevenue(startDate, endDate),
        enabled: !!(startDate && endDate),
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (booking: Omit<Booking, "id" | "bookingReference" | "createdAt">) =>
            bookingsApi.create(booking),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            toast.success("Reserva creada correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al crear la reserva");
        },
    });
}

export function useUpdateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Booking> }) =>
            bookingsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            toast.success("Reserva actualizada correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al actualizar la reserva");
        },
    });
}

export function useDeleteBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => bookingsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            toast.success("Reserva eliminada correctamente");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al eliminar la reserva");
        },
    });
}

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
            bookingsApi.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            toast.success("Estado actualizado", {
                description: "El estado de la reserva ha sido actualizado",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "No se pudo actualizar el estado",
            });
        },
    });
};