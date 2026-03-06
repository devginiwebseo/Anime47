import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Logo({ src }: { src?: string }) {
    const [error, setError] = React.useState(false);

    // Only attempt to show image if src is provided and is not the known-missing default
    const showImage = src && src !== '/logo.png' && !error;

    return (
        <Link href="/" className="flex-shrink-0">
            <div className="relative h-auto  max-h-[100px] flex items-center">
                {showImage ? (
                    <div className="relative w-[200px] h-[80px]">
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
                    <span className="text-2xl font-black italic tracking-tighter text-white">
                        ANIME<span className="text-primary font-bold">47</span>
                    </span>
                )}
            </div>
        </Link>
    );
}
