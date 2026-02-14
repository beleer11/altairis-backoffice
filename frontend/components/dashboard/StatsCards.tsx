import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn("hover:shadow-lg transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
                <div className="rounded-lg bg-blue-50 p-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                {description && (
                    <p className="mt-1 text-xs text-slate-500">{description}</p>
                )}
                {trend && (
                    <div className="mt-2 flex items-center gap-1">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </span>
                        <span className="text-xs text-slate-500">vs mes anterior</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}