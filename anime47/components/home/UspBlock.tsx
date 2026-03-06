import React from 'react';

interface UspItem {
    icon: string;
    title: string;
    description: string;
}

interface UspBlockProps {
    title: string;
    subtitle: string;
    items: UspItem[];
}

export default function UspBlock({ title, subtitle, items }: UspBlockProps) {
    if (!items || items.length === 0) return null;

    return (
        <section className="mb-12 py-12 px-4 max-w-6xl mx-auto">
            <div className="text-center mb-12">
                {title && <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">{title}</h2>}
                {subtitle && <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item, idx) => {
                    const isObj = typeof item === 'object' && item !== null;
                    const icon = isObj ? item.icon : '✨';
                    const itemTitle = isObj ? item.title : item;
                    const desc = isObj ? item.description : '';

                    return (
                        <div key={idx} className="flex gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                                {icon || '✨'}
                            </div>
                            <div className="space-y-1 pt-1">
                                <h3 className="font-bold text-gray-900 text-lg leading-snug">{itemTitle}</h3>
                                {desc && <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
