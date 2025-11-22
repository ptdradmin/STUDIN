
'use client';

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

interface SearchPanelProps {
    activePanel: string | null;
    setActivePanel: (panel: string | null) => void;
}


export default function SearchPanel({ activePanel, setActivePanel }: SearchPanelProps) {
    
    return (
        <div 
            className={`fixed left-[72px] top-0 h-full z-10 bg-background border-r transition-transform duration-300 ${activePanel === 'search' ? 'translate-x-0' : '-translate-x-full'}`}
            style={{width: '400px'}}
        >
            <div className="p-6 h-full flex flex-col">
                <h2 className="text-2xl font-bold">Recherche</h2>
                <div className="relative mt-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Rechercher" className="pl-10 bg-muted border-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                <Separator className="my-6" />

                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground">Aucune recherche récente.</p>
                </div>
            </div>
        </div>
    )
}
