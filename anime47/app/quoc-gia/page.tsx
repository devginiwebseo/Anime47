import React from 'react';
import Link from 'next/link';
import { fetchExternalApi } from '@/lib/external-api';

export const metadata = {
    title: 'Quốc Gia - Anime47',
    description: 'Danh sách quốc gia và số lượng anime hiện có trên Anime47.',
};

export default async function CountriesPage() {
    const res = await fetchExternalApi('/api/public/countries', {
        next: { revalidate: 60 },
    });

    let result: { success: boolean; data: any[] } = { success: false, data: [] };
    if (res.ok) {
        result = await res.json();
    }

    const countries = result.data || [];

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="mt-4 rounded-lg border-l-4 border-primary bg-gray-800 p-4 sm:mt-6 sm:p-5 lg:p-6">
                <h1 className="mb-2 flex items-center gap-2 text-xl font-bold uppercase text-white sm:text-2xl">
                    Quốc Gia
                </h1>
                <p className="text-sm text-gray-400 sm:text-base">
                    Khám phá anime theo quốc gia phát hành. Hiện có{' '}
                    <span className="text-primary font-bold">{countries.length}</span> quốc gia trên hệ thống.
                </p>
            </div>

            {countries.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {countries.map((country: any) => (
                        <Link
                            key={country.id}
                            href={`/quoc-gia/${country.slug}`}
                            className="group rounded-lg border border-gray-700 bg-gray-800 p-4 transition-all hover:-translate-y-1 hover:border-primary sm:p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white transition-colors group-hover:text-primary sm:text-xl">
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
                <div className="rounded-lg bg-gray-800 p-8 text-center sm:p-12">
                    <p className="text-base text-gray-400 sm:text-lg">Đang cập nhật dữ liệu quốc gia</p>
                </div>
            )}
        </div>
    );
}
