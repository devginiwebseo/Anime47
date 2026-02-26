import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@anime47.com'
  const adminPassword = 'admin123456'
  
  console.log('--- SEEDING ADMIN USER ---')
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      console.log(`User ${adminEmail} already exists. Updating role and password...`)
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          name: 'Admin'
        }
      })
      console.log('Admin user updated successfully.')
    } else {
      console.log(`Creating new admin user: ${adminEmail}`)
      const newUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN'
        }
      })
      console.log('Admin user created successfully.')
    }
  } catch (error) {
    console.error('Error seeding admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
