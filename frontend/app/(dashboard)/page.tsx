"use client";

import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DoorOpen, BookOpen, TrendingUp } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { hotelsApi } from "@/lib/api/hotels";
import { bookingsApi } from "@/lib/api/bookings";
import { roomTypesApi } from "@/lib/api/rooms";
import { formatCurrency } from "@/lib/utils";

// Mock data para gráficos
const occupancyData = [
    { month: "Ene", ocupacion: 65, disponible: 35 },
    { month: "Feb", ocupacion: 72, disponible: 28 },
    { month: "Mar", ocupacion: 78, disponible: 22 },
    { month: "Abr", ocupacion: 85, disponible: 15 },
    { month: "May", ocupacion: 92, disponible: 8 },
    { month: "Jun", ocupacion: 88, disponible: 12 },
];

const revenueData = [
    { month: "Ene", ingresos: 45000 },
    { month: "Feb", ingresos: 52000 },
    { month: "Mar", ingresos: 61000 },
    { month: "Abr", ingresos: 70000 },
    { month: "May", ingresos: 85000 },
    { month: "Jun", ingresos: 78000 },
];

export default function DashboardPage() {
    // Fetch data
    const { data: hotels } = useQuery({
        queryKey: ["hotels"],
        queryFn: () => hotelsApi.getAll(1, 100),
    });

    const { data: bookings } = useQuery({
        queryKey: ["bookings"],
        queryFn: () => bookingsApi.getAll(1, 100),
    });

    const { data: roomTypes } = useQuery({
        queryKey: ["roomTypes"],
        queryFn: () => roomTypesApi.getAll(),
    });

    const totalHotels = hotels?.data?.length || 0;
    const totalRooms = roomTypes?.reduce((acc, rt) => acc + rt.totalRooms, 0) || 0;
    const activeBookings = bookings?.data?.filter((b) => b.status === 1).length || 0;
    const totalRevenue = bookings?.data?.reduce((acc, b) => acc + b.totalPrice, 0) || 0;

    return (
        <div className="flex flex-col">
            <Header
                title="Dashboard"
                description="Visión general de tu operación hotelera"
            />

            <div className="flex-1 space-y-6 p-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Hoteles Activos"
                        value={totalHotels}
                        icon={Building2}
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatsCard
                        title="Habitaciones"
                        value={totalRooms}
                        icon={DoorOpen}
                        trend={{ value: 5, isPositive: true }}
                    />
                    <StatsCard
                        title="Reservas Activas"
                        value={activeBookings}
                        icon={BookOpen}
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatsCard
                        title="Ingresos del Mes"
                        value={formatCurrency(totalRevenue)}
                        icon={TrendingUp}
                        trend={{ value: 15, isPositive: true }}
                    />
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Occupancy Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Ocupación Mensual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={occupancyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="ocupacion" fill="#3b82f6" name="Ocupadas %" />
                                    <Bar dataKey="disponible" fill="#94a3b8" name="Disponibles %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Revenue Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Ingresos Mensuales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number | undefined) =>
                                            value !== undefined ? formatCurrency(value) : 'N/A'
                                        }
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="ingresos"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        name="Ingresos (€)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Últimas Reservas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bookings?.data?.slice(0, 5).map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {booking.guestName}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Ref: {booking.bookingReference}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-900">
                                            {formatCurrency(booking.totalPrice)}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {booking.numberOfGuests} huéspedes
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}