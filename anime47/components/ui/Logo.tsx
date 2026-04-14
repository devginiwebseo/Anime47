import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/image-url';

interface LogoProps {
    src?: string;
    compact?: boolean;
}

// Helper to resolve admin/local images
function resolveLogoUrl(url?: string): string {
    if (!url) return '/logo.png';
    const trimmed = url.trim();
    if (!trimmed) return '/logo.png';
    if (trimmed.startsWith('/upload/')) return trimmed;
    return resolveImageUrl(trimmed) || '/logo.png';
}

export default function Logo({ src, compact = false }: LogoProps) {
    const [error, setError] = React.useState(false);

    const resolvedSrc = resolveLogoUrl(src);
    const isDefault = resolvedSrc === '/logo.png';
    const showImage = !isDefault && !error;

    const imageSizeClass = compact
        ? 'w-[130px] h-[50px] sm:w-[132px] sm:h-[46px] md:w-[180px] md:h-[70px]'
        : 'w-[132px] h-[48px] sm:w-[160px] sm:h-[60px] md:w-[200px] md:h-[80px]';
    const textSizeClass = compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl';

    return (
        <Link href="/" className="flex-shrink-0">
            <div className="relative h-auto max-h-[130px] flex items-center">
                {showImage ? (
                    <div className={`relative ${imageSizeClass}`}>
                        <Image
                            src={resolvedSrc}
                            alt="Anime47"
                            fill
                            className="object-contain"
                            priority
                            onError={() => setError(true)}
                        />
                    </div>
                ) : (
                    <span className={`${textSizeClass} font-black italic tracking-tighter text-white uppercase`}>
                        ANIME<span className="text-primary font-bold">EZ</span>
                    </span>
                )}
            </div>
        </Link>
    );
}
