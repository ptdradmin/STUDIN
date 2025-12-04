

'use client';

import { useState } from 'react';
import Image from 'next/image';
import RegisterForm from '@/components/register-form';
import RegisterInstitutionForm from '@/components/register-institution-form';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoIcon } from '@/components/logo-icon';

type Role = 'student' | 'institution';

export default function RegisterPage() {
    const [role, setRole] = useState<Role>('student');

    return (
        <div className="container relative flex min-h-screen flex-col items-center justify-center py-10">
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                    <LogoIcon />
                    <span className="font-headline">STUD'IN</span>
                </Link>
            </div>
            
            <Card className="w-full max-w-lg shadow-2xl">
                <CardContent className="p-4 pb-6">
                    <Tabs value={role} onValueChange={(value) => setRole(value as Role)} className="w-full mb-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="student">Étudiant</TabsTrigger>
                            <TabsTrigger value="institution">Institution</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {role === 'student' ? <RegisterForm /> : <RegisterInstitutionForm />}
                </CardContent>
            </Card>
        </div>
    );
}

    
