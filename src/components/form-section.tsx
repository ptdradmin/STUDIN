
'use client';

export default function FormSection({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <div className="md:col-span-1">
                <h3 className="font-semibold text-base">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="md:col-span-2 space-y-4">
                {children}
            </div>
        </div>
    );
}
