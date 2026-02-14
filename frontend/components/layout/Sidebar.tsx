"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    DoorOpen,
    Calendar,
    BookOpen,
    Hotel,
} from "lucide-react";

const navigation = [
    {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        name: "Hoteles",
        href: "/hotels",
        icon: Building2,
    },
    {
        name: "Habitaciones",
        href: "/rooms",
        icon: DoorOpen,
    },
    {
        name: "Inventario",
        href: "/inventory",
        icon: Calendar,
    },
    {
        name: "Reservas",
        href: "/bookings",
        icon: BookOpen,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
                <Hotel className="h-8 w-8 text-blue-400" />
                <div>
                    <h1 className="text-lg font-bold">Altairis</h1>
                    <p className="text-xs text-slate-400">Backoffice</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Admin</p>
                        <p className="text-xs text-slate-400">admin@altairis.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}