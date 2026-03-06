import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSettings() {
  const settings = await prisma.settings.findUnique({
    where: { key: 'header' }
  })
  if (settings && (settings.value as any).menuItems) {
    (settings.value as any).menuItems.forEach((item: any) => {
        console.log(`Label: ${item.label} | Has Submenu: ${!!item.submenu}`)
    })
  }
}

checkSettings()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
