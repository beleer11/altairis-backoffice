"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateRoomType } from "@/hooks/use-rooms";
import { RoomType } from "@/lib/types";
import { Edit } from "lucide-react";
import { toast } from "sonner";

interface RoomTypeEditDialogProps {
    roomType: RoomType;
    onSuccess?: () => void;
}

export function RoomTypeEditDialog({ roomType, onSuccess }: RoomTypeEditDialogProps) {
    const [open, setOpen] = useState(false);
    const updateMutation = useUpdateRoomType();

    const [formData, setFormData] = useState({
        name: roomType.name,
        description: roomType.description || "",
        capacity: roomType.capacity,
        totalRooms: roomType.totalRooms,
        basePrice: roomType.basePrice,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: roomType.name,
                description: roomType.description || "",
                capacity: roomType.capacity,
                totalRooms: roomType.totalRooms,
                basePrice: roomType.basePrice,
            });
        }
    }, [open, roomType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Campo requerido", { description: "El nombre es obligatorio" });
            return;
        }

        const dataToSend = {
            id: roomType.id,
            name: formData.name,
            description: formData.description,
            capacity: formData.capacity,
            totalRooms: formData.totalRooms,
            basePrice: formData.basePrice,
            hotelId: roomType.hotelId,
        };

        updateMutation.mutate(
            { id: roomType.id, data: dataToSend },
            {
                onSuccess: () => {
                    setOpen(false);
                    onSuccess?.();
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Tipo de Habitación</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nombre *</Label>
                        <Input
                            id="edit-name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Habitación Doble Superior"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Características de la habitación..."
                            rows={3}
                        />
                    </div>

                    {/* Capacidad y Total Habitaciones */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-capacity">Capacidad</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-totalRooms">Total Habitaciones</Label>
                            <Input
                                id="edit-totalRooms"
                                type="number"
                                min="1"
                                value={formData.totalRooms}
                                onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Precio Base */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-basePrice">Precio Base (€) *</Label>
                        <Input
                            id="edit-basePrice"
                            type="number"
                            min="0"
                            max="10000"
                            step="0.01"
                            required
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}