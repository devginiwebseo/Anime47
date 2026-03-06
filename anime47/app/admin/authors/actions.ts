'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/helpers'

export async function createAuthor(formData: FormData) {
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatarUrl = formData.get('avatarUrl') as string
    const slug = slugify(name)
    const id = crypto.randomUUID()

    await prisma.authors.create({
        data: {
            id,
            name,
            slug,
            bio,
            avatarUrl,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/authors')
}

export async function updateAuthor(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatarUrl = formData.get('avatarUrl') as string
    const slug = slugify(name)

    await prisma.authors.update({
        where: { id },
        data: {
            name,
            slug,
            bio,
            avatarUrl,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/authors')
}

export async function deleteAuthor(id: string) {
    await prisma.authors.delete({
        where: { id }
    })

    revalidatePath('/admin/authors')
}
