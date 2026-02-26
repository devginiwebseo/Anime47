import React from 'react';

interface AnimeDescriptionProps {
    title: string;
    description: string;
    plot?: string;
}

export default function AnimeDescription({ title, description, plot }: AnimeDescriptionProps) {
    return (
        <div className="bg-[#14151a] rounded-lg p-6 md:p-8">
            <h2 className="text-primary text-2xl font-bold mb-6">
                {title}: Khám Phá Câu Chuyện Đầy Kịch Tính
            </h2>

            <div className="space-y-5 text-gray-300 text-[15px] leading-relaxed">
                {description.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>

            {/* Blockquote feature matching screenshot 4 */}
            <div className="mt-8 border-l-2 border-primary pl-5 py-2">
                <p className="text-gray-500 italic text-[15px] leading-relaxed">
                    {plot ? (
                        `"${plot}" Cùng sống lại những năm tháng thanh xuân rực rỡ nhất, bấm XEM NGAY `
                    ) : (
                        `"Cơ hội không tự nhiên sinh ra, mà nó được tạo ra từ chính đôi bàn tay rớm máu vì nỗ lực của chúng ta." Cùng sống lại những năm tháng thanh xuân rực rỡ nhất, bấm XEM NGAY `
                    )}
                    <span className="text-gray-400 font-semibold">[{title}]</span> tại <span className="text-primary font-bold">Anime47</span>!
                </p>
            </div>
        </div>
    );
}
