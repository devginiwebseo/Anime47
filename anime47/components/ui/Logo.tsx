import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
    src?: string;
    compact?: boolean;
}

export default function Logo({ src, compact = false }: LogoProps) {
    const [error, setError] = React.useState(false);

    // Only attempt to show image if src is provided and is not the known-missing default
    const showImage = src && src !== '/logo.png' && !error;
    const imageSizeClass = compact
        ? 'w-[112px] h-[40px] sm:w-[132px] sm:h-[46px] md:w-[160px] md:h-[56px]'
        : 'w-[132px] h-[48px] sm:w-[160px] sm:h-[60px] md:w-[200px] md:h-[80px]';
    const textSizeClass = compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl';

    return (
        <Link href="/" className="flex-shrink-0">
            <div className="relative h-auto max-h-[100px] flex items-center">
                {showImage ? (
                    <div className={`relative ${imageSizeClass}`}>
                        <Image
                            src={src!}
                            alt="Anime47"
                            fill
                            className="object-contain"
                            priority
                            onError={() => setError(true)}
                        />
                    </div>
                ) : (
                    <span className={`${textSizeClass} font-black italic tracking-tighter text-white`}>
                        ANIME<span className="text-primary font-bold">47</span>
                    </span>
                )}
            </div>
        </Link>
    );
}
