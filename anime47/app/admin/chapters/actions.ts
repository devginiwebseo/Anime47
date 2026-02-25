'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/helpers'

export async function createChapter(formData: FormData) {
    const storyId = formData.get('storyId') as string
    const title = formData.get('title') as string
    const indexStr = formData.get('index') as string
    const videoUrl = formData.get('videoUrl') as string
    
    // Server validation check
    if (!storyId || !title) throw new Error('Vui lòng điền các trường bắt buộc')

    const index = parseInt(indexStr) || 1
    const slug = slugify(title)
    const id = crypto.randomUUID()

    await prisma.chapters.create({
        data: {
            id,
            storyId,
            title,
            slug,
            index,
            videoUrl,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/chapters')
}

export async function updateChapter(id: string, formData: FormData) {
    const title = formData.get('title') as string
    const indexStr = formData.get('index') as string
    const videoUrl = formData.get('videoUrl') as string
    
    const index = parseInt(indexStr) || 1
    const slug = slugify(title)

    await prisma.chapters.update({
        where: { id },
        data: {
            title,
            slug,
            index,
            videoUrl,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/chapters')
}

export async function deleteChapter(id: string) {
    await prisma.chapters.delete({
        where: { id }
    })

    revalidatePath('/admin/chapters')
}
