"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

export default function ProfileClientPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=/profile');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} />
            <AvatarFallback>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{user.first_name} {user.last_name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Université:</span>
                <span className="font-semibold">{user.university || 'Non spécifié'}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Domaine d'études:</span>
                <span className="font-semibold">{user.field_of_study || 'Non spécifié'}</span>
            </div>
        </div>
        <Button onClick={logout} variant="destructive" className="w-full sm:w-auto">
          Déconnexion
        </Button>
      </CardContent>
    </Card>
  );
}
