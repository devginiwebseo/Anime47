"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface MainLayoutWrapperProps {
    children: React.ReactNode;
}

export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) {
        return (
            <>
                <div className="min-h-screen bg-white text-gray-900">{children}</div>
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900">
            <Header />
            <main className="flex-1 w-full p-0  container mx-auto text-white">{children}</main>
            <Footer />
        </div>
    );
}

