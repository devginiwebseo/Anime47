"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

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
                        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase">
                                {session?.user?.name?.[0] || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-white">
                                    {session?.user?.name || "Quản trị viên"}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {session?.user?.email || "Quyền Hệ Thống"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)] rounded-xl transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
