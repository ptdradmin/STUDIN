import { Card, CardContent } from "@/components/ui/card";

export default function TutoringPage() {
  return (
    <>
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-4xl font-bold">📚 Tutorat</h1>
                <p className="mt-2 text-lg opacity-90">Trouvez de l'aide ou proposez vos services</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-8">
            <Card className="text-center py-20">
                <CardContent>
                    <h3 className="text-2xl font-semibold">Bientôt disponible !</h3>
                    <p className="text-muted-foreground mt-2">La section tutorat est en cours de construction.</p>
                </CardContent>
            </Card>
        </div>
    </>
  );
}
