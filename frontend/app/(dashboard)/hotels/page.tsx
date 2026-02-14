"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Phone, Mail, Star, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelsApi } from "@/lib/api/hotels";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Hotel } from "@/lib/types";

export default function HotelsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [hotel, setHotel] = useState<Hotel>({} as Hotel)

    const { data: hotels, isLoading } = useQuery({
        queryKey: ["hotels"],
        queryFn: () => hotelsApi.getAll(1, 100),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => hotelsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            toast.success("Hotel eliminado correctamente");
        },
        onError: (error: any) => {
            const backendMessage = error.response?.data?.message;

            toast.error("No se pudo eliminar", {
                description: backendMessage || "Error al eliminar el hotel",
                duration: 5000
            });

        },
    });

    const filteredHotels = hotels?.data?.filter((hotel) =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (hotel: Hotel) => {
        setHotel(hotel)
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        setShowDeleteDialog(false);

        deleteMutation.mutate(hotel.id);
    };

    return (
        <div className="flex flex-col">
            <Header
                title="Hoteles"
                description="Gestiona tu catálogo de hoteles"
            />

            <div className="flex-1 space-y-6 p-8">
                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <Input
                        placeholder="Buscar hoteles por nombre, ciudad o país..."
                        className="max-w-md"
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                    <Link href="/hotels/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Hotel
                        </Button>
                    </Link>
                </div>

                {/* Hotels Grid */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-48 bg-slate-200" />
                                <CardContent className="space-y-3 pt-6">
                                    <div className="h-6 bg-slate-200 rounded" />
                                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredHotels?.map((hotel) => (
                            <Card
                                key={hotel.id}
                                className="group overflow-hidden transition-all hover:shadow-xl"
                            >
                                <CardHeader className="relative h-48 bg-linear-to-br from-blue-500 to-blue-700 p-6">
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="relative flex h-full flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-1">
                                                {[...Array(hotel.starRating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                                    />
                                                ))}
                                            </div>
                                            {hotel.isActive && (
                                                <Badge className="bg-green-500">Activo</Badge>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">
                                                {hotel.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-white/80">
                                                {hotel.roomTypes?.length || 0} tipos de habitación
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-6">
                                    {hotel.description && (
                                        <p className="line-clamp-2 text-sm text-slate-600">
                                            {hotel.description}
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        {hotel.city && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                {hotel.city}, {hotel.country}
                                            </div>
                                        )}
                                        {hotel.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                {hotel.phone}
                                            </div>
                                        )}
                                        {hotel.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                {hotel.email}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex gap-2 border-t bg-slate-50 p-4">
                                    <Link href={`/hotels/${hotel.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </Button>
                                    </Link>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => { handleDelete(hotel) }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {filteredHotels?.length === 0 && !isLoading && (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg font-medium text-slate-900">
                                No se encontraron hoteles
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Prueba con otros términos de búsqueda
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={confirmDelete}
                title="Eliminar hotel"
                description={`¿Estás seguro de eliminar "${hotel.name}"? Esta acción no se puede deshacer y se eliminarán todas las habitaciones asociadas.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
            />
        </div>
    );
}