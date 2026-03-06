import { prisma } from '@/lib/prisma';
import HomepageSettingsForm from '@/components/admin/settings/HomepageSettingsForm';

export const metadata = { title: 'Cài đặt Trang chủ - Admin Panel' };

export default async function AdminHomepageSettingsPage() {
    // Lấy settings blocks từ DB
    const homepageSetting = await prisma.settings.findUnique({ where: { key: 'homepage_blocks' } });

    // Cấu hình mặc định nếu chưa có
    const defaultBlocks = [
        {
            id: 'default-new',
            type: 'NEW_RELEASES',
            isHidden: false,
            title: 'ANIME MỚI CẬP NHẬT',
            numColumns: 5,
            limit: 20,
        },
        {
            id: 'default-soon',
            type: 'COMING_SOON',
            isHidden: false,
            title: 'ANIME SẮP CHIẾU',
            numColumns: 4,
            limit: 8,
        },
        {
            id: 'default-recommended',
            type: 'RECOMMENDED',
            isHidden: false,
            title: 'ANIME ĐỀ CỬ',
            numColumns: 4,
            limit: 8,
        },
        {
            id: 'default-hot',
            type: 'HOT',
            isHidden: false,
            title: 'ANIME HOT',
            limit: 10,
        },
        {
            id: 'default-ranking',
            type: 'RANKING',
            isHidden: false,
            title: 'BẢNG XẾP HẠNG',
        }
    ];

    const blocks = homepageSetting?.value ? (homepageSetting.value as any) : defaultBlocks;

    // Lấy danh sách thể loại để dùng cho Khối Theo Thể Loại
    const genres = await prisma.genres.findMany({ select: { id: true, name: true, slug: true } });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Cài Đặt Trang Chủ</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý các khối hiển thị trên trang chủ</p>
            </div>

            <HomepageSettingsForm
                initialBlocks={blocks}
                genres={genres}
            />
        </div>
    );
}
