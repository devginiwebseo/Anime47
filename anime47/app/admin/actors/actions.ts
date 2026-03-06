'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/helpers'

export async function createActor(formData: FormData) {
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatarUrl = formData.get('avatarUrl') as string
    const slug = slugify(name)
    const id = crypto.randomUUID()

    await prisma.actors.create({
        data: {
            id,
            name,
            slug,
            bio,
            avatarUrl,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/actors')
}

export async function updateActor(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatarUrl = formData.get('avatarUrl') as string
    const slug = slugify(name)

    await prisma.actors.update({
        where: { id },
        data: {
            name,
            slug,
            bio,
            avatarUrl,
            updatedAt: new Date()
        }
    })

    revalidatePath('/admin/actors')
}

export async function deleteActor(id: string) {
    await prisma.actors.delete({
        where: { id }
    })

    revalidatePath('/admin/actors')
}
