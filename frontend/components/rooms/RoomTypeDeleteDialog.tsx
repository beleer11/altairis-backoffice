"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteRoomType } from "@/hooks/use-rooms";
import { RoomType } from "@/lib/types";
import { toast } from "sonner";

interface RoomTypeDeleteDialogProps {
    roomType: RoomType;
    onSuccess?: () => void;
}

export function RoomTypeDeleteDialog({ roomType, onSuccess }: RoomTypeDeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const deleteMutation = useDeleteRoomType();

    const handleDelete = () => {
        deleteMutation.mutate(roomType.id, {
            onSuccess: () => {
                setOpen(false);
                onSuccess?.();
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    size="sm"
                >
                    Eliminar
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Vas a eliminar el tipo de habitación <strong>"{roomType.name}"</strong>.
                        Esta acción no se puede deshacer y podría afectar a reservas existentes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}