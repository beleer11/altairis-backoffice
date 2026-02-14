"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useBooking, useUpdateBooking, useDeleteBooking, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { use, useState } from "react";
import {
    BookingStatus,
    BookingStatusLabels,
} from "@/lib/types";
import {
    Calendar,
    User,
    Mail,
    Phone,
    Users,
    Bed,
    Euro,
    Clock,
    Hash,
    Edit,
    Trash2,
    Save,
    X,
    CheckCircle2,
} from "lucide-react";
import {
    formatCurrency,
    formatLongDate,
    formatShortDate,
    calculateNights,
} from "@/lib/utils";

const statusColors: Record<BookingStatus, string> = {
    [BookingStatus.Pending]: "bg-yellow-100 text-yellow-800",
    [BookingStatus.Confirmed]: "bg-blue-100 text-blue-800",
    [BookingStatus.CheckedIn]: "bg-green-100 text-green-800",
    [BookingStatus.CheckedOut]: "bg-slate-100 text-slate-800",
    [BookingStatus.Cancelled]: "bg-red-100 text-red-800",
    [BookingStatus.NoShow]: "bg-orange-100 text-orange-800",
};

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const bookingId = parseInt(id);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<BookingStatus | null>(null);

    const { data: booking, isLoading } = useBooking(bookingId);
    const updateStatusMutation = useUpdateBookingStatus();
    const deleteMutation = useDeleteBooking();

    const handleUpdateStatus = () => {
        if (newStatus !== null) {
            updateStatusMutation.mutate(
                { id: bookingId, status: newStatus },
                {
                    onSuccess: () => {
                        setIsEditingStatus(false);
                        setNewStatus(null);
                    },
                }
            );
        }
    };

    const handleDelete = () => {
        if (
            confirm(
                "¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer."
            )
        ) {
            deleteMutation.mutate(bookingId, {
                onSuccess: () => {
                    router.push("/bookings");
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col">
                <Header title="Cargando..." description="Obteniendo datos de la reserva" />
                <div className="flex-1 p-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-48 bg-slate-200 rounded-lg" />
                        <div className="h-96 bg-slate-200 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col">
                <Header title="Error" description="Reserva no encontrada" />
                <div className="flex-1 p-8">
                    <Card className="p-12">
                        <div className="text-center">
                            <p className="text-lg text-slate-600">La reserva no existe</p>
                            <Button className="mt-4" onClick={() => router.push("/bookings")}>
                                Volver a Reservas
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    const nights = calculateNights(booking.checkIn, booking.checkOut);
    const pricePerNight = nights > 0 ? booking.totalPrice / nights : booking.totalPrice;

    return (
        <div className="flex flex-col">
            <Header
                title={`Reserva ${booking.bookingReference}`}
                description={`Detalles de la reserva de ${booking.guestName}`}
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
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Header Card */}
                    <Card className="overflow-hidden">
                        <div className="relative bg-linear-to-r from-blue-500 to-purple-600 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Hash className="h-5 w-5 text-white/80" />
                                        <span className="text-2xl font-bold text-white">
                                            {booking.bookingReference}
                                        </span>
                                    </div>
                                    <p className="text-white/90 text-lg">{booking.guestName}</p>
                                    <p className="text-white/70 text-sm mt-1">
                                        {booking.roomType?.name} • {booking.roomType?.hotel?.name}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {isEditingStatus ? (
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={newStatus?.toString() || booking.status.toString()}
                                                onValueChange={(value) => setNewStatus(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-48 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(BookingStatusLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={handleUpdateStatus}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setIsEditingStatus(false);
                                                    setNewStatus(null);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusColors[booking.status]}>
                                                {BookingStatusLabels[booking.status]}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setIsEditingStatus(true)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-white/70 text-sm">
                                        Creada: {formatShortDate(booking.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <CardContent className="grid gap-4 md:grid-cols-4 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Noches</p>
                                    <p className="text-xl font-bold">{nights}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-50 p-3">
                                    <Users className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Huéspedes</p>
                                    <p className="text-xl font-bold">{booking.numberOfGuests}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-50 p-3">
                                    <Euro className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total</p>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(booking.totalPrice)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-50 p-3">
                                    <Bed className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Por noche</p>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(pricePerNight)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="details" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Detalles</TabsTrigger>
                            <TabsTrigger value="guest">Huésped</TabsTrigger>
                            <TabsTrigger value="room">Habitación</TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información de la Reserva</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Dates */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">Check-in</span>
                                            </div>
                                            <p className="text-lg font-semibold">
                                                {formatLongDate(booking.checkIn)}
                                            </p>
                                            <p className="text-sm text-slate-600">A partir de las 15:00</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">Check-out</span>
                                            </div>
                                            <p className="text-lg font-semibold">
                                                {formatLongDate(booking.checkOut)}
                                            </p>
                                            <p className="text-sm text-slate-600">Hasta las 12:00</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Pricing */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold">Desglose de Precio</h3>
                                        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">
                                                    {formatCurrency(pricePerNight)} x {nights} noche
                                                    {nights !== 1 ? "s" : ""}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(booking.totalPrice)}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span>{formatCurrency(booking.totalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.notes && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">Notas</h3>
                                                <p className="text-slate-600 rounded-lg bg-slate-50 p-4">
                                                    {booking.notes}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    {/* Metadata */}
                                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock className="h-4 w-4" />
                                            <span>Creada: {formatLongDate(booking.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Hash className="h-4 w-4" />
                                            <span>ID: {booking.id}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Guest Tab */}
                        <TabsContent value="guest">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Huésped</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {booking.guestName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">{booking.guestName}</h3>
                                            <p className="text-sm text-slate-600">
                                                {booking.numberOfGuests} huésped
                                                {booking.numberOfGuests !== 1 ? "es" : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        {booking.guestEmail && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                                <Mail className="h-5 w-5 text-slate-400" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Email</p>
                                                    <a
                                                        href={`mailto:${booking.guestEmail}`}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        {booking.guestEmail}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {booking.guestPhone && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                                <Phone className="h-5 w-5 text-slate-400" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Teléfono</p>
                                                    <a
                                                        href={`tel:${booking.guestPhone}`}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        {booking.guestPhone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Room Tab */}
                        <TabsContent value="room">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detalles de la Habitación</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {booking.roomType ? (
                                        <>
                                            <div>
                                                <h3 className="text-xl font-semibold">
                                                    {booking.roomType.name}
                                                </h3>
                                                {booking.roomType.description && (
                                                    <p className="text-slate-600 mt-2">
                                                        {booking.roomType.description}
                                                    </p>
                                                )}
                                            </div>

                                            <Separator />

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="flex flex-col items-center rounded-lg bg-blue-50 p-4">
                                                    <Users className="h-6 w-6 text-blue-600 mb-2" />
                                                    <span className="text-sm text-slate-600">Capacidad</span>
                                                    <span className="text-xl font-bold">
                                                        {booking.roomType.capacity}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center rounded-lg bg-green-50 p-4">
                                                    <Bed className="h-6 w-6 text-green-600 mb-2" />
                                                    <span className="text-sm text-slate-600">Total Habitaciones</span>
                                                    <span className="text-xl font-bold">
                                                        {booking.roomType.totalRooms}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center rounded-lg bg-purple-50 p-4">
                                                    <Euro className="h-6 w-6 text-purple-600 mb-2" />
                                                    <span className="text-sm text-slate-600">Precio Base</span>
                                                    <span className="text-xl font-bold">
                                                        {formatCurrency(booking.roomType.basePrice)}
                                                    </span>
                                                </div>
                                            </div>

                                            {booking.roomType.hotel && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <h4 className="font-semibold mb-3">Hotel</h4>
                                                        <div className="rounded-lg bg-slate-50 p-4">
                                                            <p className="font-medium text-lg">
                                                                {booking.roomType.hotel.name}
                                                            </p>
                                                            <p className="text-slate-600 mt-1">
                                                                {booking.roomType.hotel.address}
                                                            </p>
                                                            <p className="text-slate-600">
                                                                {booking.roomType.hotel.city},{" "}
                                                                {booking.roomType.hotel.country}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-600 py-8 text-center">
                                            No hay información de habitación disponible
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <Card>
                        <CardContent className="flex gap-4 p-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push("/bookings")}
                            >
                                Volver a Reservas
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Reserva
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}