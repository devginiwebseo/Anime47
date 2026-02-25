'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 my-12">
            {/* Prev */}
            {currentPage > 1 && (
                <Link
                    href={createPageURL(currentPage - 1)}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-red-600 transition-colors"
                >
                    &laquo; Trước
                </Link>
            )}

            {/* Pages */}
            {getPageNumbers().map((page) => (
                <Link
                    key={page}
                    href={createPageURL(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${currentPage === page
                            ? 'bg-red-600 text-white font-bold'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    {page}
                </Link>
            ))}

            {/* Next */}
            {currentPage < totalPages && (
                <Link
                    href={createPageURL(currentPage + 1)}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Tiếp &raquo;
                </Link>
            )}
        </div>
    );
}
