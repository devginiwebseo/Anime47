"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface MainLayoutWrapperProps {
    children: React.ReactNode;
}

export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const { settings } = useSiteSettings();

    if (isAdmin) {
        return (
            <>
                <div className="min-h-screen bg-white text-gray-900">{children}</div>
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900">
            <style jsx global>{`
                :root {
                    --theme-primary: ${settings.theme.primaryColor || '#d32f2f'};
                    --theme-bg: ${settings.theme.backgroundColor || '#111827'};
                }
            `}</style>
            <Header />
            <main className="flex-1 w-full px-4 md:px-6 container mx-auto text-white py-6">{children}</main>
            <Footer />
        </div>
    );
}

