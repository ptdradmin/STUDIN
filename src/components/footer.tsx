
'use client';

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "./ui/button";

const footerLinks = {
    'Société': [
        { href: '/about', label: 'À propos' },
        { href: '/who-we-are', label: 'Qui sommes-nous ?' },
        { href: '/press', label: 'Presse' },
    ],
    'Légal': [
        { href: '/terms', label: 'Conditions' },
        { href: '/privacy', label: 'Confidentialité' },
    ],
    'Support': [
        { href: '/help', label: "Centre d'aide" },
        { href: '/contact', label: 'Contact' },
        { href: '/faq', label: 'FAQ' },
    ]
};

export default function Footer() {
    const { language, setLanguage } = useLanguage();

    return (
        <footer className="bg-card border-t">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                STUD'IN
                                </span>
                                <span className="text-xs -mt-1 text-muted-foreground">Wallonie-Bruxelles</span>
                            </div>
                        </Link>
                        <p className="text-muted-foreground text-sm mt-4">
                            La plateforme tout-en-un pour les étudiants.
                        </p>
                        <div className="mt-4 flex gap-2">
                             <Button
                                size="sm"
                                variant={language === 'fr' ? 'secondary' : 'ghost'}
                                onClick={() => setLanguage('fr')}
                              >
                                🇫🇷 FR
                              </Button>
                              <Button
                                size="sm"
                                variant={language === 'en' ? 'secondary' : 'ghost'}
                                onClick={() => setLanguage('en')}
                                disabled
                              >
                                🇬🇧 EN
                                <span className="text-xs ml-2 opacity-70">(bientôt)</span>
                              </Button>
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold tracking-wide text-foreground">{title}</h3>
                            <ul className="mt-4 space-y-2">
                                {links.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} STUD'IN. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
