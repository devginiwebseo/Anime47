import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'site_settings' },
    });

    if (!setting) {
      return NextResponse.json({});
    }

    return NextResponse.json(setting.value);
  } catch (error) {
    return NextResponse.json({});
  }
}
