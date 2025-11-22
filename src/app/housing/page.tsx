
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HousingClientPage from "@/components/housing-client-page";

export default async function HousingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  <div className="container mx-auto px-4 py-12 text-center">
                      <h1 className="text-4xl font-bold">🏠 Logements Étudiants</h1>
                      <p className="mt-2 text-lg opacity-90">Trouvez votre kot, studio ou colocation idéale</p>
                  </div>
              </div>
              <div className="container mx-auto px-4 py-8">
                  <HousingClientPage />
              </div>
            </main>
            <Footer />
        </div>
    );
}
