"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelsApi } from "@/lib/api/hotels";
import { useState } from "react";
import { Hotel } from "@/lib/types";

export default function NewHotelPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Hotel>>({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "",
        starRating: 3,
        phone: "",
        email: "",
        website: "",
        isActive: true,
    });

    const createMutation = useMutation({
        mutationFn: (data: Omit<Hotel, "id" | "createdAt">) => hotelsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotels"] });
            router.push("/hotels");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData as Omit<Hotel, "id" | "createdAt">);
    };

    return (
        <div className="flex flex-col">
            <Header title="Nuevo Hotel" description="Registra un nuevo hotel en el sistema" />

            <div className="flex-1 p-8">
                <div className="mx-auto max-w-3xl">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Hotel</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Hotel *</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Hotel Paraíso"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        required
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descripción del hotel..."
                                        rows={4}
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección *</Label>
                                    <Input
                                        id="address"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Calle Principal 123"
                                    />
                                </div>

                                {/* City & Country */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad</Label>
                                        <Input
                                            id="city"
                                            required
                                            value={formData.city || ""}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Madrid"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">País</Label>
                                        <Input
                                            id="country"
                                            required
                                            value={formData.country || ""}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            placeholder="España"
                                        />
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div className="space-y-2">
                                    <Label htmlFor="starRating">Categoría (Estrellas)</Label>
                                    <Select
                                        value={formData.starRating?.toString()} required
                                        onValueChange={(value) => setFormData({ ...formData, starRating: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((stars) => (
                                                <SelectItem key={stars} value={stars.toString()}>
                                                    {"⭐".repeat(stars)} {stars} Estrella{stars > 1 ? "s" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Contact Info */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            required
                                            value={formData.phone || ""}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+34 912 345 678"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email || ""}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="info@hotel.com"
                                        />
                                    </div>
                                </div>

                                {/* Website */}
                                <div className="space-y-2">
                                    <Label htmlFor="website">Sitio Web</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        required
                                        value={formData.website || ""}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://www.hotel.com"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="flex-1"
                                    >
                                        {createMutation.isPending ? "Creando..." : "Crear Hotel"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/hotels")}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}