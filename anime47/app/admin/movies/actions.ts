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

    let authorId: string | null = null;
    if (director) {
        const directorName = director.split(',')[0].trim();
        if (directorName) {
            const authorSlug = slugify(directorName);
            let author = await prisma.authors.findFirst({ where: { slug: authorSlug } });
            if (!author) {
                author = await prisma.authors.create({
                    data: { name: directorName, slug: authorSlug }
                });
            }
            authorId = author.id;
        }
    }

    await prisma.stories.create({
        data: {
            id,
            title,
            slug,
            description,
            status,
            coverImage,
            director,
            authorId,
            cast,
            updatedAt: new Date()
        }
    })
    
    await syncDirectors(id, director);
    await syncActors(id, cast);

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

    let authorId: string | null = null;
    if (director) {
        const directorName = director.split(',')[0].trim();
        if (directorName) {
            const authorSlug = slugify(directorName);
            let author = await prisma.authors.findFirst({ where: { slug: authorSlug } });
            if (!author) {
                author = await prisma.authors.create({
                    data: { name: directorName, slug: authorSlug }
                });
            }
            authorId = author.id;
        }
    }

    await prisma.stories.update({
        where: { id },
        data: {
            title,
            slug,
            description,
            status,
            coverImage,
            director,
            authorId,
            cast,
            updatedAt: new Date()
        }
    })
    
    await syncDirectors(id, director);
    await syncActors(id, cast);

    revalidatePath('/admin/movies')
}

async function syncDirectors(storyId: string, directorString: string | null | undefined) {
    if (!directorString) {
        await prisma.story_authors.deleteMany({ where: { storyId } });
        return;
    }

    const directorNames = directorString.split(',').map(name => name.trim()).filter(Boolean);
    const authorIds: string[] = [];

    for (const name of directorNames) {
        const slug = slugify(name);
        // Find existing or create new director (author)
        let author = await prisma.authors.findFirst({ where: { slug } });
        if (!author) {
            author = await prisma.authors.create({
                data: {
                    name,
                    slug,
                }
            });
        }
        authorIds.push(author.id);
    }

    // Remove old authors that are no longer in the list
    await prisma.story_authors.deleteMany({
        where: {
            storyId,
            authorId: { notIn: authorIds }
        }
    });

    // Add new author relationships
    for (const authorId of authorIds) {
        await prisma.story_authors.upsert({
            where: {
                storyId_authorId: { storyId, authorId }
            },
            update: {},
            create: {
                storyId,
                authorId
            }
        });
    }
}

async function syncActors(storyId: string, castString: string | null | undefined) {
    if (!castString) {
        await prisma.story_actors.deleteMany({ where: { storyId } });
        return;
    }

    const actorNames = castString.split(',').map(name => name.trim()).filter(Boolean);
    const actorIds: string[] = [];

    for (const name of actorNames) {
        const slug = slugify(name);
        // Find existing or create new actor
        let actor = await prisma.actors.findFirst({ where: { slug } });
        if (!actor) {
            actor = await prisma.actors.create({
                data: {
                    name,
                    slug,
                }
            });
        }
        actorIds.push(actor.id);
    }

    // Remove old actors that are no longer in the list
    await prisma.story_actors.deleteMany({
        where: {
            storyId,
            actorId: { notIn: actorIds }
        }
    });

    // Add new actor relationships
    for (const actorId of actorIds) {
        await prisma.story_actors.upsert({
            where: {
                storyId_actorId: { storyId, actorId }
            },
            update: {},
            create: {
                storyId,
                actorId
            }
        });
    }
}

export async function deleteMovie(id: string) {
    await prisma.stories.delete({
        where: { id }
    })

    revalidatePath('/admin/movies')
}
