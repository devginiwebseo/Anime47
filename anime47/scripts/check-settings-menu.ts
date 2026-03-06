import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSettings() {
  const settings = await prisma.settings.findMany({
    where: { key: 'site_settings' }
  })
  
  if (settings.length > 0) {
    const value = settings[0].value as any
    if (value && value.header && value.header.menuItems) {
      console.log('MENU ITEMS:')
      console.log(JSON.stringify(value.header.menuItems, null, 2))
    }
  }
}

checkSettings()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
