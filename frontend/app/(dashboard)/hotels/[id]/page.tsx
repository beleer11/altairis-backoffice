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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useHotel, useUpdateHotel, useDeleteHotel } from "@/hooks/use-hotels";
import { useRoomTypesByHotel } from "@/hooks/use-rooms";
import { useState, useEffect, use } from "react";
import { Hotel } from "@/lib/types";
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Star,
    Edit,
    Trash2,
    Save,
    X,
    Bed,
    Users,
    Euro,
    Plus,
} from "lucide-react";
import { formatCurrency, formatLongDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { RoomTypeFormDialog } from "@/components/rooms/RoomTypeFormDialog";

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();

    const { id } = use(params);
    const hotelId = parseInt(id);
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: hotel, isLoading } = useHotel(hotelId);
    const { data: roomTypes } = useRoomTypesByHotel(hotelId);
    const updateMutation = useUpdateHotel();
    const deleteMutation = useDeleteHotel();

    const [formData, setFormData] = useState<Partial<Hotel>>({});

    useEffect(() => {
        if (hotel) {
            const { roomTypes, ...hotelWithoutRooms } = hotel;
            setFormData(hotelWithoutRooms);
        }
    }, [hotel]);

    const handleRoomTypeCreated = () => {
        queryClient.invalidateQueries({ queryKey: ["roomTypes", hotelId] });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateMutation.mutate(
            { id: hotelId, data: formData }
        );
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        setShowDeleteDialog(false);

        deleteMutation.mutate(hotelId);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col">
                <Header title="Cargando..." description="Obteniendo datos del hotel" />
                <div className="flex-1 p-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-48 bg-slate-200 rounded-lg" />
                        <div className="h-96 bg-slate-200 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="flex flex-col">
                <Header title="Error" description="Hotel no encontrado" />
                <div className="flex-1 p-8">
                    <Card className="p-12">
                        <div className="text-center">
                            <p className="text-lg text-slate-600">El hotel no existe</p>
                            <Button className="mt-4" onClick={() => router.push("/hotels")}>
                                Volver a Hoteles
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header
                title={hotel.name}
                description={`Detalles y gestión del hotel`}
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/hotels")}
                    className="ml-auto"
                >
                    ← Volver a Hoteles
                </Button>
            </Header>

            <div className="flex-1 p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Header Card */}
                    <Card className="overflow-hidden">
                        <div className="relative h-48 bg-linear-to-br from-blue-500 to-blue-700">
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="relative flex h-full items-end p-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {[...Array(hotel.starRating)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">{hotel.name}</h1>
                                    <p className="mt-1 text-white/80">
                                        {hotel.city}, {hotel.country}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {hotel.isActive && (
                                        <Badge className="bg-green-500">Activo</Badge>
                                    )}
                                    <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                        ID: {hotel.id}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="info" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="info">Información</TabsTrigger>
                            <TabsTrigger value="rooms">
                                Habitaciones ({roomTypes?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        {/* Info Tab */}
                        <TabsContent value="info">
                            <form onSubmit={handleSubmit}>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Detalles del Hotel</CardTitle>
                                        <div className="flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Guardar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setFormData(hotel);
                                                        }}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Cancelar
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setIsEditing(true)
                                                        }
                                                        }
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={handleDelete}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre del Hotel</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="name"
                                                    value={formData.name || ""}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    required
                                                />
                                            ) : (
                                                <p className="text-lg font-medium">{hotel.name}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descripción</Label>
                                            {isEditing ? (
                                                <Textarea
                                                    id="description"
                                                    value={formData.description || ""}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, description: e.target.value })
                                                    }
                                                    rows={4}
                                                />
                                            ) : (
                                                <p className="text-slate-600">
                                                    {hotel.description || "Sin descripción"}
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Location */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Dirección</Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="address"
                                                        value={formData.address || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, address: e.target.value })
                                                        }
                                                        required
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <MapPin className="h-4 w-4" />
                                                        {hotel.address}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="starRating">Categoría</Label>
                                                {isEditing ? (
                                                    <Select
                                                        value={formData.starRating?.toString()}
                                                        onValueChange={(value) =>
                                                            setFormData({
                                                                ...formData,
                                                                starRating: parseInt(value),
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5].map((stars) => (
                                                                <SelectItem key={stars} value={stars.toString()}>
                                                                    {"⭐".repeat(stars)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(hotel.starRating)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Ciudad</Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="city"
                                                        value={formData.city || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, city: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <p className="text-slate-600">{hotel.city}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country">País</Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="country"
                                                        value={formData.country || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, country: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <p className="text-slate-600">{hotel.country}</p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Contact */}
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Teléfono</Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={formData.phone || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, phone: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Phone className="h-4 w-4" />
                                                        {hotel.phone || "—"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, email: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Mail className="h-4 w-4" />
                                                        {hotel.email || "—"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="website">Sitio Web</Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="website"
                                                        type="url"
                                                        value={formData.website || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, website: e.target.value })
                                                        }
                                                    />
                                                ) : hotel.website ? (
                                                    <a
                                                        href={hotel.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                                    >
                                                        <Globe className="h-4 w-4" />
                                                        Visitar
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-600">—</p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Metadata */}
                                        <div className="rounded-lg bg-slate-50 p-4">
                                            <p className="text-sm text-slate-600">
                                                Creado el: {formatLongDate(hotel.createdAt)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </TabsContent>

                        {/* Rooms Tab */}
                        <TabsContent value="rooms">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Tipos de Habitación</CardTitle>
                                    <RoomTypeFormDialog
                                        hotel={hotel}
                                        onSuccess={handleRoomTypeCreated}
                                        trigger={
                                            <Button size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Nuevo Tipo
                                            </Button>
                                        }
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {roomTypes?.map((room) => (
                                            <Card key={room.id} className="border-2">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{room.name}</CardTitle>
                                                    {room.description && (
                                                        <p className="text-sm text-slate-600">
                                                            {room.description}
                                                        </p>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="flex flex-col items-center rounded-lg bg-blue-50 p-3">
                                                            <Users className="h-5 w-5 text-blue-600 mb-1" />
                                                            <span className="text-xs text-slate-600">Capacidad</span>
                                                            <span className="font-semibold">{room.capacity}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center rounded-lg bg-green-50 p-3">
                                                            <Bed className="h-5 w-5 text-green-600 mb-1" />
                                                            <span className="text-xs text-slate-600">Habitaciones</span>
                                                            <span className="font-semibold">{room.totalRooms}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center rounded-lg bg-purple-50 p-3">
                                                            <Euro className="h-5 w-5 text-purple-600 mb-1" />
                                                            <span className="text-xs text-slate-600">Precio</span>
                                                            <span className="font-semibold text-sm">
                                                                {room.basePrice}€
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                                                        <p className="text-sm text-slate-600">
                                                            Precio por noche desde
                                                        </p>
                                                        <p className="text-2xl font-bold text-slate-900">
                                                            {formatCurrency(room.basePrice)}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <ConfirmDialog
                open={showDeleteDialog}
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