'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    quality?: string;
}

interface SearchBarProps {
    compact?: boolean;
    className?: string;
}

export default function SearchBar({ compact = false, className = '' }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://anime.datatruyen.online').replace(/\/$/, '');

    const getImageSrc = (coverImage?: string) => {
        if (!coverImage) return undefined;
        if (coverImage.startsWith('http')) return coverImage;

        return `${apiBaseUrl}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);

            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);

                if (res.ok) {
                    const data = await res.json();
                    const items = Array.isArray(data) ? data : data.data || data.items || [];
                    setSuggestions(items);
                    setShowSuggestions(items.length > 0);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            setShowSuggestions(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = () => {
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const wrapperClasses = compact ? 'relative w-full' : 'relative w-full max-w-sm';
    const inputClasses = compact
        ? 'w-full rounded-xl border border-gray-800 bg-[#1d1d1f] px-4 py-2.5 pr-11 text-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary'
        : 'w-full rounded-full bg-gray-800 px-5 py-2.5 pr-12 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary';
    const buttonClasses = compact
        ? 'absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-300 transition-all duration-200 hover:text-white'
        : 'absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-white transition-all duration-200 hover:brightness-110';
    const dropdownClasses = compact
        ? 'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-800 bg-[#1d1d1f] shadow-xl'
        : 'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl';

    return (
        <div ref={wrapperRef} className={`${wrapperClasses} ${className}`.trim()}>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Tìm anime..."
                    className={inputClasses}
                />
                <button
                    type="submit"
                    className={buttonClasses}
                    aria-label="Search anime"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    )}
                </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className={dropdownClasses}>
                    {suggestions.map((item) => (
                        <Link
                            key={item.id}
                            href={`/anime/${item.slug}`}
                            onClick={handleSuggestionClick}
                            className="flex items-center gap-3 p-3 transition-colors hover:bg-gray-700"
                        >
                            <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-900">
                                {item.coverImage ? (
                                    <Image
                                        src={getImageSrc(item.coverImage) || '/placeholder-anime.png'}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                                        ?
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{item.title}</p>
                                {item.quality && <span className="text-xs text-primary">{item.quality}</span>}
                            </div>
                        </Link>
                    ))}
                    <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={handleSuggestionClick}
                        className="block border-t border-gray-700 p-3 text-center text-sm text-primary hover:bg-gray-700"
                    >
                        Xem tat ca ket qua
                    </Link>
                </div>
            )}
        </div>
    );
}
