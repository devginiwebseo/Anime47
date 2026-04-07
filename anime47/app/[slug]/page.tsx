import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await props.params;

    const pageData = await prisma.pages.findUnique({
        where: { slug }
    });

    if (!pageData) {
        return {
            title: '404 - Not Found',
        };
    }

    return {
        title: pageData.metaTitle || `${pageData.title} | Anime47`,
        description: pageData.metaDescription || `Cập nhật thông tin về ${pageData.title} tại Anime47`,
    };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Ignore internal next.js files mapping errors
    if (slug.includes('.') || slug === 'favicon.ico') {
        notFound();
    }
    
    const pageData = await prisma.pages.findUnique({
        where: { slug }
    });

    if (!pageData || !pageData.isPublished) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 min-h-screen">
            {/* Tiêu đề trang */}
            <div className="text-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight">
                    {pageData.title}
                </h1>
                <div className="w-12 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Nội dung tĩnh */}
            <div 
                className="w-full text-gray-300 leading-relaxed text-[15px] break-words
                           [&>p]:mb-4
                           [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mt-8 [&>h2]:mb-4
                           [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-primary [&>h3]:mt-6 [&>h3]:mb-3
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:marker:text-gray-400
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
                           [&_a]:text-blue-500 [&_a]:underline-offset-2 hover:[&_a]:text-blue-400 hover:[&_a]:underline
                           [&_img]:rounded-xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto
                           [&_strong]:text-white [&_b]:text-white"
                dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
        </div>
    );
}
