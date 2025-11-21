import ProfileClientPage from "@/components/profile-client-page";
import Navbar from "@/components/navbar";

export default function ProfilePage() {
    return (
        <>
            <Navbar />
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Mon Profil</h1>
                    <p className="mt-2 text-lg opacity-90">Gérez vos informations personnelles</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <ProfileClientPage />
            </div>
        </>
    );
}