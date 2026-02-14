"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/lib/api/inventory";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditInventoryDialogProps {
    inventory: {
        id: number;
        date: string;
        availableRooms: number;
        pricePerNight: number;
        roomTypeId: number;
    };
    onSuccess?: () => void;
}

export function EditInventoryDialog({ inventory, onSuccess }: EditInventoryDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        availableRooms: inventory.availableRooms,
        pricePerNight: inventory.pricePerNight,
    });

    const updateMutation = useMutation({
        mutationFn: (data: { availableRooms: number; price: number }) =>
            inventoryApi.updateAvailability(
                inventory.roomTypeId,
                inventory.date,
                data.availableRooms,
                data.price
            ),
        onSuccess: () => {
            toast.success("Inventario actualizado", {
                description: `Disponibilidad actualizada para ${format(new Date(inventory.date), "dd/MM/yyyy")}`,
            });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            setOpen(false);
            onSuccess?.();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Error al actualizar";
            toast.error("Error", { description: errorMessage });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.availableRooms < 0) {
            toast.error("Error", { description: "Las habitaciones disponibles no pueden ser negativas" });
            return;
        }

        if (formData.pricePerNight < 0) {
            toast.error("Error", { description: "El precio no puede ser negativo" });
            return;
        }

        updateMutation.mutate({
            availableRooms: formData.availableRooms,
            price: formData.pricePerNight
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Editar Inventario - {format(new Date(inventory.date), "dd/MM/yyyy")}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="availableRooms">Habitaciones Disponibles</Label>
                        <Input
                            id="availableRooms"
                            type="number"
                            min="0"
                            value={formData.availableRooms}
                            onChange={(e) => setFormData({
                                ...formData,
                                availableRooms: parseInt(e.target.value)
                            })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Precio por Noche (€)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.pricePerNight}
                            onChange={(e) => setFormData({
                                ...formData,
                                pricePerNight: parseFloat(e.target.value)
                            })}
                        />
                    </div>

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