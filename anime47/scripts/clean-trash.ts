import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanTrash() {
  console.log('--- Cleaning Trash Data ---')
  
  const blacklist = ['rikvip', 'hitclub', 'game bài', 'cá cược', 'cá độ', 'nhà cái', 'link vào', 'giới thiệu rikvip', 'giới thiệu hitclub', 'nổ hũ', 'bắn cá', 'tài xỉu', 'soi cầu']
  
  const stories = await prisma.stories.findMany({
    select: { id: true, title: true, coverImage: true, _count: { select: { chapters: true } } }
  })
  
  let deletedCount = 0
  
  for (const story of stories) {
    const isBlacklisted = blacklist.some(word => story.title.toLowerCase().includes(word))
    const noContent = !story.coverImage && story._count.chapters === 0
    
    if (isBlacklisted || noContent) {
      console.log(`Deleting trash: ${story.title} (Blacklisted: ${isBlacklisted}, No Content: ${noContent})`)
      
      // Delete relations first if not cascade
      await prisma.story_genres.deleteMany({ where: { storyId: story.id } })
      await prisma.story_actors.deleteMany({ where: { storyId: story.id } })
      await prisma.story_tags.deleteMany({ where: { storyId: story.id } })
      await prisma.story_authors.deleteMany({ where: { storyId: story.id } })
      await prisma.chapters.deleteMany({ where: { storyId: story.id } })
      await prisma.stories.delete({ where: { id: story.id } })
      
      deletedCount++
    }
  }
  
  console.log(`--- Cleaned ${deletedCount} stories ---`)
}

cleanTrash()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
