import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSettings() {
  const settings = await prisma.settings.findUnique({
    where: { key: 'site_settings' }
  })
  if (settings) {
    console.log(JSON.stringify(settings.value, null, 2))
  }
}

checkSettings()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
