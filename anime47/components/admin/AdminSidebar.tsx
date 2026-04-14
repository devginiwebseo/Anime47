"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import ProfileModal from "./ProfileModal";

const menuItems = [
    {
        group: "Tương Tác",
        items: [
            { name: "Báo Cáo", href: "/admin/reports" },
        ],
    },
    {
        group: "Hệ Thống",
        items: [
            { name: "Tài Khoản", href: "/admin/users" },
            { name: "Quản Lý Trang", href: "/admin/pages" },
            { name: "Cài Đặt Chung", href: "/admin/settings" },
            { name: "Cài Đặt Trang Chủ", href: "/admin/settings/homepage" },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleLogout = () => {
        signOut({ callbackUrl: "/admin/login" });
    };

    return (
        <>
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0F172A] text-white sticky top-0 z-30 shadow-md">
                <Link href="/admin">
                    <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        ANIME47
                    </h2>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-400 hover:text-white focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white h-screen border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
                md:relative md:translate-x-0
            `}
            >
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-800 md:border-none">
                    <Link href="/admin">
                        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            ANIME47
                            <span className="block text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">
                                Bảng Điều Khiển
                            </span>
                        </h2>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 md:py-0 overflow-y-auto">
                    <div className="space-y-8">
                        {menuItems.map((group) => (
                            <div key={group.group}>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
                                    {group.group}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const active = pathname === item.href;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                    active
                                                        ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                }`}
                                            >
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                                                        active
                                                            ? "bg-blue-400 scale-100"
                                                            : "bg-slate-600 group-hover:bg-slate-400 scale-50 group-hover:scale-75"
                                                    }`}
                                                />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex flex-col space-y-3">
                        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center space-x-3 group hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase group-hover:scale-105 transition-transform">
                                {session?.user?.name?.[0] || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-white flex items-center gap-2">
                                    {session?.user?.name || "Quản trị viên"}
                                    <svg className="w-3 h-3 text-slate-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {session?.user?.email || "Quyền Hệ Thống"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Cài đặt</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)] rounded-xl transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </>
    );
}
