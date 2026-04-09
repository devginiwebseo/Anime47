'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RandomAnimeButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRandom = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch('/api/public/random', {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error(`Random anime request failed with status ${res.status}`);
            }

            const data = await res.json();
            if (data.success && data.data) {
                if (data.data.link) {
                    router.push(data.data.link);
                } else if (data.data.slug) {
                    router.push(`/anime/${data.data.slug}/`);
                }
            }
        } catch (error) {
            console.error('Random anime failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRandom}
            disabled={loading}
            className="w-full mt-6 bg-primary hover:brightness-110 text-white py-3 px-4 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70"
        >
            <span className={`text-lg ${loading ? 'animate-spin' : ''}`}>🎲</span>
            <span className="uppercase tracking-tight">
                {loading ? 'Đang tìm phim...' : 'Xem anime ngẫu nhiên'}
            </span>
        </button>
    );
}
