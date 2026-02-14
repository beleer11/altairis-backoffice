"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { roomTypesApi } from "@/lib/api/rooms";
import { hotelsApi } from "@/lib/api/hotels";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { inventoryApi } from "@/lib/api/inventory";
import { EditInventoryDialog } from "@/components/inventory/EditInventoryDialog";

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [selectedHotel, setSelectedHotel] = useState<string>("");
    const [selectedRoomType, setSelectedRoomType] = useState<string>("");

    useEffect(() => {
        setSelectedRoomType("");
    }, [selectedHotel]);

    const { data: hotels } = useQuery({
        queryKey: ["hotels"],
        queryFn: () => hotelsApi.getAll(1, 100),
    });

    const { data: roomTypes } = useQuery({
        queryKey: ["roomTypes", selectedHotel],
        queryFn: () =>
            selectedHotel
                ? roomTypesApi.getByHotel(parseInt(selectedHotel))
                : Promise.resolve([]),
        enabled: !!selectedHotel,
    });

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = addDays(startDate, 30);
    endDate.setUTCHours(23, 59, 59, 999);

    const { data: inventory } = useQuery({
        queryKey: ["inventory", selectedRoomType, startDate.toISOString(), endDate.toISOString()],
        queryFn: () =>
            inventoryApi.getByRoomType(
                parseInt(selectedRoomType),
                startDate.toISOString(),
                endDate.toISOString()
            ),
        enabled: !!selectedRoomType,
    });

    const totalAvailable = inventory?.reduce((acc, inv) => acc + inv.availableRooms, 0) || 0;
    const totalBooked = inventory?.reduce((acc, inv) => acc + inv.bookedRooms, 0) || 0;
    const avgOccupancy = totalBooked && totalAvailable
        ? ((totalBooked / (totalBooked + totalAvailable)) * 100).toFixed(1)
        : 0;
    const totalRevenue = inventory?.reduce(
        (acc, inv) => acc + inv.bookedRooms * inv.pricePerNight,
        0
    ) || 0;

    return (
        <div className="flex flex-col">
            <Header
                title="Gestión de Inventario"
                description="Controla la disponibilidad y precios de tus habitaciones"
            />

            <div className="flex-1 space-y-6 p-8">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hotel</label>
                                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Habitación</label>
                                <Select
                                    value={selectedRoomType}
                                    onValueChange={setSelectedRoomType}
                                    disabled={!selectedHotel}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            !selectedHotel
                                                ? "Primero selecciona un hotel"
                                                : roomTypes?.length === 0
                                                    ? "Este hotel no tiene habitaciones"
                                                    : "Selecciona un tipo de habitación"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes?.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedHotel && roomTypes?.length === 0 && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        Este hotel no tiene tipos de habitación configurados
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                {selectedRoomType && inventory && (
                    <>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Disponibles</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {totalAvailable}
                                            </p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Reservadas</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {totalBooked}
                                            </p>
                                        </div>
                                        <TrendingDown className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Ocupación</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {avgOccupancy}%
                                            </p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Ingresos Est.</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(totalRevenue)}
                                            </p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-orange-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Inventory Calendar */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Calendario de Disponibilidad (Próximos 30 días)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {inventory.map((inv) => {
                                        const occupancyRate = inv.bookedRooms / (inv.availableRooms + inv.bookedRooms) * 100;
                                        const isHighOccupancy = occupancyRate > 80;
                                        const isMediumOccupancy = occupancyRate > 50 && occupancyRate <= 80;

                                        return (
                                            <div
                                                key={inv.id}
                                                className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32">
                                                        <p className="font-medium">{formatShortDate(inv.date)}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {format(new Date(inv.date), "EEEE")}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div>
                                                            <p className="text-sm text-slate-600">Disponibles</p>
                                                            <p className="font-semibold text-green-600">
                                                                {inv.availableRooms}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-600">Reservadas</p>
                                                            <p className="font-semibold text-blue-600">
                                                                {inv.bookedRooms}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <Badge
                                                        className={
                                                            isHighOccupancy
                                                                ? "bg-red-100 text-red-800"
                                                                : isMediumOccupancy
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-green-100 text-green-800"
                                                        }
                                                    >
                                                        {occupancyRate.toFixed(0)}% ocupación
                                                    </Badge>

                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-600">Precio/noche</p>
                                                        <p className="font-bold text-slate-900">
                                                            {formatCurrency(inv.pricePerNight)}
                                                        </p>
                                                    </div>

                                                    <EditInventoryDialog
                                                        inventory={inv}
                                                        onSuccess={() => {
                                                            // Refrescar datos
                                                            queryClient.invalidateQueries({ queryKey: ["inventory"] });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {!selectedRoomType && (
                    <Card className="p-12">
                        <div className="text-center">
                            <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-medium text-slate-900">
                                Selecciona un hotel y tipo de habitación
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Usa los filtros de arriba para ver el inventario disponible
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}