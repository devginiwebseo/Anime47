import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Quốc Gia - Anime47',
    description: 'Danh sách quốc gia và số lượng anime hiện có trên Anime47.',
};

export default async function CountriesPage() {
    const apiUrl = process.env.API_URL || 'https://api.animeez.online';
    const res = await fetch(`${apiUrl}/api/public/countries`, {
        next: { revalidate: 60 },
    });

    let result: { success: boolean; data: any[] } = { success: false, data: [] };
    if (res.ok) {
        result = await res.json();
    }

    const countries = result.data || [];

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 mt-6 border-l-4 border-primary">
                <h1 className="text-2xl font-bold text-white mb-2 uppercase flex items-center gap-2">
                     Quốc Gia
                </h1>
                <p className="text-gray-400">
                    Khám phá anime theo quốc gia phát hành. Hiện có{' '}
                    <span className="text-primary font-bold">{countries.length}</span> quốc gia trên hệ thống.
                </p>
            </div>

            {countries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countries.map((country: any) => (
                        <Link
                            key={country.id}
                            href={`/quoc-gia/${country.slug}`}
                            className="group bg-gray-800 rounded-lg border border-gray-700 p-5 hover:border-primary hover:-translate-y-1 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                        {country.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {country.description || `Danh sách anime đến từ ${country.name}.`}
                                    </p>
                                </div>
                                <div className="shrink-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                                    {country.totalMovies || 0}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">Đang cập nhật dữ liệu quốc gia</p>
                </div>
            )}
        </div>
    );
}
