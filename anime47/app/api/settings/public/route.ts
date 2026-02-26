import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [headerSetting, footerSetting, themeSetting] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'header' } }),
      prisma.settings.findUnique({ where: { key: 'footer' } }),
      prisma.settings.findUnique({ where: { key: 'theme' } })
    ]);

    return NextResponse.json({
      header: headerSetting?.value || {},
      footer: footerSetting?.value || {},
      theme: themeSetting?.value || {},
    });
  } catch (error) {
    return NextResponse.json({ header: {}, footer: {}, theme: {} });
  }
}
