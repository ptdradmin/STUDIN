import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold">Paramètres</h1>
          <p className="mt-2 text-lg opacity-90">Gérez les paramètres de votre compte et de l'application</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <SettingsIcon className="mr-2 h-6 w-6" />
                    Paramètres du compte
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-center py-10">
                    <p className="text-muted-foreground">D'autres paramètres seront bientôt disponibles.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
