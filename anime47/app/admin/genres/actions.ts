'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/helpers'

export async function createGenre(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const slug = slugify(name)
    const id = crypto.randomUUID()

    await prisma.genres.create({
        data: {
            id,
            name,
            slug,
            description,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/genres')
}

export async function updateGenre(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const slug = slugify(name)

    await prisma.genres.update({
        where: { id },
        data: {
            name,
            slug,
            description,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/genres')
}

export async function deleteGenre(id: string) {
    await prisma.genres.delete({
        where: { id }
    })

    revalidatePath('/admin/genres')
}
