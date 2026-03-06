import React from 'react';

interface IntroductionBlockProps {
    title: string;
    description: string;
}

export default function IntroductionBlock({ title, description }: IntroductionBlockProps) {
    if (!title && !description) return null;

    return (
        <section className="mb-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 text-center border border-gray-700/50 shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                {title && (
                    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight leading-tight">
                        {title}
                    </h2>
                )}
                {description && (
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
}
