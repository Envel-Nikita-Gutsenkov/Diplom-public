import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@admin.com'
  const newPassword = 'admin'

  console.log(`[INFO] Attempting to reset password for ${adminEmail}...`)

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    }
  })

  console.log(`[OK] Success! Admin password for ${adminEmail} has been reset to: ${newPassword}`)
}

main()
  .catch((e) => {
    console.error(`[ERROR] ${e.message}`)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
