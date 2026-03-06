import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSettings() {
  const settings = await prisma.settings.findMany()
  settings.forEach(s => console.log(`Key: ${s.key}`))
}

checkSettings()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
