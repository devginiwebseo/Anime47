import React from 'react';

interface AnimeDescriptionProps {
    title: string;
    description: string;
    plot?: string;
}

export default function AnimeDescription({ title, description, plot }: AnimeDescriptionProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-bold mb-4 border-b border-gray-700 pb-3">
                {title}: Khi "Com Trộ" Nhân Đôi, Rắc Rối Cũng Gấp Bội
            </h2>

            <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                {description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}

                {plot && (
                    <div className="mt-6 p-4 bg-gray-900 rounded border-l-4 border-red-600">
                        <h3 className="text-white font-semibold mb-2">📖 Cốt Truyện</h3>
                        <p className="text-gray-300">{plot}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
