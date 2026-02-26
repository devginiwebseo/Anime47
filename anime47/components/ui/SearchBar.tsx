'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
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
                    setSuggestions(data);
                    setShowSuggestions(true);
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

    return (
        <div ref={wrapperRef} className="relative w-full max-w-sm">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Tìm anime..."
                    className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-full px-5 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
                <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:brightness-110 text-white rounded-full p-2 transition-all duration-200"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
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

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                    {suggestions.map((item) => (
                        <Link
                            key={item.id}
                            href={`/anime/${item.slug}`}
                            onClick={handleSuggestionClick}
                            className="flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors"
                        >
                            <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-900">
                                {item.coverImage ? (
                                    <Image
                                        src={item.coverImage}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        🎬
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                {item.quality && (
                                    <span className="text-xs text-primary">{item.quality}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                    <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={handleSuggestionClick}
                        className="block p-3 text-center text-sm text-primary hover:bg-gray-700 border-t border-gray-700"
                    >
                        Xem tất cả kết quả →
                    </Link>
                </div>
            )}
        </div>
    );
}
