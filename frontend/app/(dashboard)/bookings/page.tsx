"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { BookingStatus, BookingStatusLabels } from "@/lib/types";
import { useState } from "react";
import Link from "next/link";

const statusColors: Record<BookingStatus, string> = {
    [BookingStatus.Pending]: "bg-yellow-100 text-yellow-800",
    [BookingStatus.Confirmed]: "bg-blue-100 text-blue-800",
    [BookingStatus.CheckedIn]: "bg-green-100 text-green-800",
    [BookingStatus.CheckedOut]: "bg-slate-100 text-slate-800",
    [BookingStatus.Cancelled]: "bg-red-100 text-red-800",
    [BookingStatus.NoShow]: "bg-orange-100 text-orange-800",
};

export default function BookingsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["bookings"],
        queryFn: () => bookingsApi.getAll(1, 100),
    });

    const filteredBookings = bookings?.data?.filter(
        (booking) =>
            booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col">
            <Header
                title="Reservas"
                description="Gestiona todas las reservas de tus hoteles"
            />

            <div className="flex-1 space-y-6 p-8">
                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre, referencia o email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link href="/bookings/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Reserva
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        {
                            label: "Total Reservas",
                            value: bookings?.data?.length || 0,
                            color: "bg-blue-500",
                        },
                        {
                            label: "Confirmadas",
                            value:
                                bookings?.data?.filter((b) => b.status === BookingStatus.Confirmed)
                                    .length || 0,
                            color: "bg-green-500",
                        },
                        {
                            label: "Pendientes",
                            value:
                                bookings?.data?.filter((b) => b.status === BookingStatus.Pending)
                                    .length || 0,
                            color: "bg-yellow-500",
                        },
                        {
                            label: "Canceladas",
                            value:
                                bookings?.data?.filter((b) => b.status === BookingStatus.Cancelled)
                                    .length || 0,
                            color: "bg-red-500",
                        },
                    ].map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-lg ${stat.color}`} />
                                    <div>
                                        <p className="text-sm text-slate-600">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bookings Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referencia</TableHead>
                                    <TableHead>Huésped</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Check-out</TableHead>
                                    <TableHead>Huéspedes</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={8}>
                                                <div className="h-12 animate-pulse bg-slate-100 rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredBookings && filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">
                                                {booking.bookingReference}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{booking.guestName}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {booking.guestEmail}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatShortDate(booking.checkIn)}</TableCell>
                                            <TableCell>{formatShortDate(booking.checkOut)}</TableCell>
                                            <TableCell>{booking.numberOfGuests}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(booking.totalPrice)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[booking.status]}>
                                                    {BookingStatusLabels[booking.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/bookings/${booking.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12">
                                            <p className="text-slate-500">No se encontraron reservas</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}