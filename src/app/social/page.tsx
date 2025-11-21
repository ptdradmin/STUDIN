import PostCard from "@/components/post-card";
import { getPosts } from "@/lib/mock-data";
import { Camera } from 'lucide-react';
import Navbar from "@/components/navbar";
import Link from "next/link";

export default async function SocialPage() {
    const posts = await getPosts();
    
    return (
        <div className="flex flex-col">
            <Navbar />
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                 <div className="container flex h-16 items-center justify-between">
                    <Link href="/social">
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                            STUD'IN Social
                        </h1>
                    </Link>
                    <button>
                        <Camera className="h-6 w-6" />
                    </button>
                </div>
            </header>
            <main className="container mx-auto px-0 md:px-4 py-4">
                <div className="max-w-xl mx-auto">
                    <div className="space-y-4">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
