import SocialClientPage from "@/components/social-client-page";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SocialPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <SocialClientPage />
            <Footer />
        </div>
    );
}
