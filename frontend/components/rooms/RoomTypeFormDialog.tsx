"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { roomTypesApi } from "@/lib/api/rooms";
import { hotelsApi } from "@/lib/api/hotels";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Hotel } from "@/lib/types";

interface RoomTypeFormDialogProps {
    hotel?: Hotel;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function RoomTypeFormDialog({ hotel, onSuccess, trigger }: RoomTypeFormDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: hotels } = useQuery({
        queryKey: ["hotels-simple"],
        queryFn: () => hotelsApi.getAll(1, 100),
        enabled: !hotel?.id && open,
    });

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        capacity: 2,
        totalRooms: 1,
        basePrice: 0,
        hotelId: hotel?.id || 0,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: "",
                description: "",
                capacity: 2,
                totalRooms: 1,
                basePrice: 0,
                hotelId: hotel?.id || 0,
            });
        }
    }, [open, hotel?.id]);

    const createMutation = useMutation({
        mutationFn: (data: any) => {
            const payload = {
                name: data.name,
                description: data.description,
                capacity: data.capacity,
                totalRooms: data.totalRooms,
                basePrice: data.basePrice,
                hotelId: data.hotelId,
            };

            return roomTypesApi.create(payload);
        },
        onSuccess: (newRoomType) => {
            toast.success("Tipo de habitación creado correctamente", {
                description: `${newRoomType.name} ha sido agregado`,
            });

            setOpen(false);

            queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
            if (hotel?.id) {
                queryClient.invalidateQueries({ queryKey: ["roomTypes", hotel.id] });
            }

            onSuccess?.();
        },
        onError: (error: any) => {
            console.error("Error completo:", error.response?.data);
            const errorMessage = error.response?.data?.message
                || error.response?.data?.errors?.Hotel?.[0]
                || error.message
                || "Error al crear el tipo de habitación";
            toast.error("Error", { description: errorMessage });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Campo requerido", { description: "El nombre es obligatorio" });
            return;
        }

        if (!formData.hotelId) {
            toast.error("Campo requerido", { description: "Debes seleccionar un hotel" });
            return;
        }

        if (formData.basePrice > 10000) {
            toast.error("Error", { description: "El precio no puede ser mayor a 10,000€" });
            return;
        }

        createMutation.mutate(formData);
    };

    const defaultTrigger = (
        <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Tipo de Habitación
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {hotel?.id ? "Nuevo Tipo de Habitación" : "Agregar Habitación a Hotel"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Selector de Hotel (solo si no hay hotel predefinido) */}
                    {!hotel?.id && (
                        <div className="space-y-2">
                            <Label htmlFor="hotel">Hotel *</Label>
                            <Select
                                value={formData.hotelId?.toString()}
                                onValueChange={(value) => setFormData({ ...formData, hotelId: parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotels?.data?.map((hotel) => (
                                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                            {hotel.name} - {hotel.city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {hotel?.id && (
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Hotel</p>
                            <p className="font-medium">{hotel.name}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Habitación Doble Superior"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Características de la habitación..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacidad</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalRooms">Total Habitaciones</Label>
                            <Input
                                id="totalRooms"
                                type="number"
                                min="1"
                                value={formData.totalRooms}
                                onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="basePrice">Precio Base (€) *</Label>
                        <Input
                            id="basePrice"
                            type="number"
                            min="0"
                            max="10000"
                            step="0.01"
                            required
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Creando..." : "Crear Habitación"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}