import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Logo({ src }: { src?: string }) {
    return (
        <Link href="/" className="flex-shrink-0">
            <div className="relative w-[150px] h-[50px]">
                <Image
                    src={src || "/logo.png"}
                    alt="Anime47"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </Link>
    );
}
