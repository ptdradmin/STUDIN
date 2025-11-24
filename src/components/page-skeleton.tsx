
'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
    return (
         <div className="flex flex-col min-h-screen">
            <div className="container mx-auto my-8">
                <div className="max-w-xl mx-auto">
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="rounded-none md:rounded-lg border-x-0 md:border p-3">
             <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="aspect-square w-full" />
            <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    )
}
