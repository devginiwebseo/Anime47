'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/helpers'

export async function createMovie(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const coverImage = formData.get('coverImage') as string
    const director = formData.get('director') as string
    const cast = formData.get('cast') as string
    
    const slug = slugify(title)
    const id = crypto.randomUUID()

    await prisma.stories.create({
        data: {
            id,
            title,
            slug,
            description,
            status,
            coverImage,
            director,
            cast,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/movies')
}

export async function updateMovie(id: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const coverImage = formData.get('coverImage') as string
    const director = formData.get('director') as string
    const cast = formData.get('cast') as string
    
    // Normally you wouldn't update slug unless specifically requested to prevent breaking links
    const slug = slugify(title)

    await prisma.stories.update({
        where: { id },
        data: {
            title,
            slug,
            description,
            status,
            coverImage,
            director,
            cast,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/movies')
}

export async function deleteMovie(id: string) {
    await prisma.stories.delete({
        where: { id }
    })

    revalidatePath('/admin/movies')
}
