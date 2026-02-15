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
    const isDashboard = pathname?.startsWith("/admin");

    if (isDashboard) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900">
            <Header />
            <main className="flex-1 w-full p-0">{children}</main>
            <Footer />
        </div>
    );
}

