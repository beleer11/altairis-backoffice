"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bed, Euro } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { roomTypesApi } from "@/lib/api/rooms";
import { hotelsApi } from "@/lib/api/hotels";
import { formatCurrency } from "@/lib/utils";
import { RoomTypeFormDialog } from "@/components/rooms/RoomTypeFormDialog";
import { RoomTypeEditDialog } from "@/components/rooms/RoomTypeEditDialog";
import { RoomTypeDeleteDialog } from "@/components/rooms/RoomTypeDeleteDialog";

export default function RoomsPage() {
    const queryClient = useQueryClient();

    const { data: roomTypes, isLoading } = useQuery({
        queryKey: ["roomTypes"],
        queryFn: () => roomTypesApi.getAll(),
    });

    const { data: hotels } = useQuery({
        queryKey: ["hotels"],
        queryFn: () => hotelsApi.getAll(1, 100),
    });

    const hotelsMap = hotels?.data?.reduce((acc, hotel) => {
        acc[hotel.id] = hotel;
        return acc;
    }, {} as Record<number, typeof hotels.data[0]>);

    const roomsByHotel = roomTypes?.reduce((acc, room) => {
        const hotelId = room.hotelId;
        if (!acc[hotelId]) {
            acc[hotelId] = [];
        }
        acc[hotelId].push(room);
        return acc;
    }, {} as Record<number, typeof roomTypes>);

    const handleRoomTypeChange = () => {
        queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
    };

    return (
        <div className="flex flex-col">
            <Header
                title="Tipos de Habitación"
                description="Gestiona los tipos de habitaciones de tus hoteles"
            />

            <div className="flex-1 space-y-8 p-8">
                <div className="flex justify-end">
                    <RoomTypeFormDialog />
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-16 bg-slate-100" />
                                <CardContent className="space-y-4 pt-6">
                                    <div className="h-32 bg-slate-100 rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {hotels?.data?.map((hotel) => {
                            const hotelRooms = roomsByHotel?.[hotel.id] || [];

                            if (hotelRooms.length === 0) return null;

                            return (
                                <Card key={hotel.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl">{hotel.name}</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {hotel.city}, {hotel.country}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {hotelRooms.length} tipo{hotelRooms.length !== 1 ? "s" : ""}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {hotelRooms.map((room) => (
                                                <Card
                                                    key={room.id}
                                                    className="border-2 hover:border-blue-500 transition-colors"
                                                >
                                                    <CardHeader className="space-y-3">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">
                                                                    {room.name}
                                                                </h3>
                                                                {room.description && (
                                                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                                        {room.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {/* Stats */}
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-3">
                                                                <Users className="h-5 w-5 text-blue-600 mb-1" />
                                                                <span className="text-xs text-slate-600">Capacidad</span>
                                                                <span className="font-semibold">{room.capacity}</span>
                                                            </div>
                                                            <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-3">
                                                                <Bed className="h-5 w-5 text-green-600 mb-1" />
                                                                <span className="text-xs text-slate-600">Habitaciones</span>
                                                                <span className="font-semibold">{room.totalRooms}</span>
                                                            </div>
                                                            <div className="flex flex-col items-center justify-center rounded-lg bg-purple-50 p-3">
                                                                <Euro className="h-5 w-5 text-purple-600 mb-1" />
                                                                <span className="text-xs text-slate-600">Precio base</span>
                                                                <span className="font-semibold text-sm">
                                                                    {room.basePrice}€
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Price Display */}
                                                        <div className="rounded-lg bg-slate-50 p-3 text-center">
                                                            <p className="text-sm text-slate-600">Precio por noche desde</p>
                                                            <p className="text-2xl font-bold text-slate-900">
                                                                {formatCurrency(room.basePrice)}
                                                            </p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-2">
                                                            <RoomTypeEditDialog
                                                                roomType={room}
                                                                onSuccess={handleRoomTypeChange}
                                                            />
                                                            <RoomTypeDeleteDialog
                                                                roomType={room}
                                                                onSuccess={handleRoomTypeChange}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {roomTypes?.length === 0 && !isLoading && (
                    <Card className="p-12">
                        <div className="text-center">
                            <Bed className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-medium text-slate-900">
                                No hay tipos de habitación
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Comienza agregando tipos de habitaciones a tus hoteles
                            </p>
                            <RoomTypeFormDialog />
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}