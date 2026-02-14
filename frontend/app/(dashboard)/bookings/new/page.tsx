"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import { hotelsApi } from "@/lib/api/hotels";
import { roomTypesApi } from "@/lib/api/rooms";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Users, Euro, Bed } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { addDays, differenceInDays } from "date-fns";

export default function NewBookingPage() {
    const router = useRouter();
    const [selectedHotel, setSelectedHotel] = useState<string>("");
    const [formData, setFormData] = useState({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        checkIn: "",
        checkOut: "",
        numberOfGuests: 2,
        roomTypeId: "",
        notes: "",
        status: 0,
    });

    const { data: hotels } = useQuery({
        queryKey: ["hotels"],
        queryFn: () => hotelsApi.getAll(1, 100),
    });

    const { data: roomTypes } = useQuery({
        queryKey: ["roomTypes", selectedHotel],
        queryFn: () => roomTypesApi.getByHotel(parseInt(selectedHotel)),
        enabled: !!selectedHotel,
    });

    const selectedRoomType = roomTypes?.find(rt => rt.id === parseInt(formData.roomTypeId));
    const nights = formData.checkIn && formData.checkOut
        ? differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn))
        : 0;
    const estimatedTotal = selectedRoomType && nights > 0
        ? selectedRoomType.basePrice * nights
        : 0;

    const createMutation = useMutation({
        mutationFn: (data: any) => bookingsApi.create(data),
        onSuccess: () => {
            toast.success("Reserva creada", {
                description: "La reserva ha sido creada correctamente",
            });
            router.push("/bookings");
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "No se pudo crear la reserva",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.guestName.trim()) {
            toast.error("Campo requerido", { description: "El nombre del huésped es obligatorio" });
            return;
        }

        if (!formData.checkIn || !formData.checkOut) {
            toast.error("Campo requerido", { description: "Las fechas de check-in y check-out son obligatorias" });
            return;
        }

        if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
            toast.error("Error", { description: "La fecha de check-out debe ser posterior al check-in" });
            return;
        }

        if (!formData.roomTypeId) {
            toast.error("Campo requerido", { description: "Debes seleccionar un tipo de habitación" });
            return;
        }

        const dataToSend = {
            ...formData,
            totalPrice: estimatedTotal,
            checkIn: new Date(formData.checkIn).toISOString(),
            checkOut: new Date(formData.checkOut).toISOString(),
        };

        createMutation.mutate(dataToSend);
    };

    return (
        <div className="flex flex-col">
            <Header
                title="Nueva Reserva"
                description="Registra una nueva reserva en el sistema"
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/bookings")}
                    className="ml-auto"
                >
                    ← Volver a Reservas
                </Button>
            </Header>

            <div className="flex-1 p-8">
                <div className="mx-auto max-w-3xl">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de la Reserva</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Hotel */}
                                <div className="space-y-2">
                                    <Label htmlFor="hotel">Hotel *</Label>
                                    <Select
                                        value={selectedHotel}
                                        onValueChange={(value) => {
                                            setSelectedHotel(value);
                                            setFormData({ ...formData, roomTypeId: "" });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un hotel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hotels?.data?.map((hotel) => (
                                                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                                    {hotel.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tipo de Habitación */}
                                <div className="space-y-2">
                                    <Label htmlFor="roomTypeId">Tipo de Habitación *</Label>
                                    <Select
                                        value={formData.roomTypeId}
                                        onValueChange={(value) => setFormData({ ...formData, roomTypeId: value })}
                                        disabled={!selectedHotel}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                !selectedHotel
                                                    ? "Primero selecciona un hotel"
                                                    : "Selecciona un tipo de habitación"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roomTypes?.map((room) => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{room.name}</span>
                                                        <span className="text-sm text-slate-500 ml-4">
                                                            {formatCurrency(room.basePrice)}/noche
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Fechas */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="checkIn">Check-in *</Label>
                                        <Input
                                            id="checkIn"
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.checkIn}
                                            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="checkOut">Check-out *</Label>
                                        <Input
                                            id="checkOut"
                                            type="date"
                                            required
                                            min={formData.checkIn || new Date().toISOString().split('T')[0]}
                                            value={formData.checkOut}
                                            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Huéspedes */}
                                <div className="space-y-2">
                                    <Label htmlFor="numberOfGuests">Número de Huéspedes</Label>
                                    <Input
                                        id="numberOfGuests"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.numberOfGuests}
                                        onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="border-t pt-4" />

                                {/* Información del Huésped */}
                                <div className="space-y-2">
                                    <Label htmlFor="guestName">Nombre del Huésped *</Label>
                                    <Input
                                        id="guestName"
                                        required
                                        value={formData.guestName}
                                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                        placeholder="Juan Pérez"
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="guestEmail">Email</Label>
                                        <Input
                                            id="guestEmail"
                                            type="email"
                                            value={formData.guestEmail}
                                            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                                            placeholder="juan@email.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guestPhone">Teléfono</Label>
                                        <Input
                                            id="guestPhone"
                                            type="tel"
                                            value={formData.guestPhone}
                                            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                                            placeholder="+34 612 345 678"
                                        />
                                    </div>
                                </div>

                                {/* Notas */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas adicionales</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Preferencias del huésped, solicitudes especiales..."
                                        rows={3}
                                    />
                                </div>

                                {/* Resumen de Precio */}
                                {selectedRoomType && nights > 0 && (
                                    <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Euro className="h-4 w-4" />
                                            Resumen de Precio
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">
                                                    {formatCurrency(selectedRoomType.basePrice)} x {nights} noche
                                                    {nights !== 1 ? "s" : ""}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(selectedRoomType.basePrice * nights)}
                                                </span>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between font-bold">
                                                <span>Total estimado</span>
                                                <span>{formatCurrency(estimatedTotal)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">
                                                * El precio final puede variar según disponibilidad
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Botones */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? "Creando..." : "Crear Reserva"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/bookings")}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}