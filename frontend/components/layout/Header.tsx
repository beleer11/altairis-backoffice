"use client";

interface HeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
    return (
        <div className="border-b bg-white px-8 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    )}
                </div>
                {children && <div>{children}</div>}
            </div>
        </div>
    );
}