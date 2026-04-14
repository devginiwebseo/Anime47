'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            {/* Animated 404 Text */}
            <h1 className="text-[120px] sm:text-[180px] md:text-[240px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50 animate-pulse drop-shadow-2xl">
                404
            </h1>

            {/* Error Message */}
            <div className="mt-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Oops! Lạc vào không gian hư vô rồi...
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
                    Trang bạn đang tìm kiếm dường như không tồn tại, đã bị xóa, hoặc không có thật. 
                    Hãy quay lại trang chủ để tiếp tục khám phá thế giới Anime nhé!
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 bg-primary"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Về Trang Chủ
                </Link>
                
                <Link
                    href="/the-loai/anime-bo"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-white/5 border border-gray-800 transition-all hover:bg-white/10 hover:-translate-y-1 active:translate-y-0"
                >
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Khám phá Anime
                </Link>
            </div>

            {/* Decorative background element */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        </div>
    );
}
