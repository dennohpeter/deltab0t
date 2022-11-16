import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const Main = async () => {
  let defaultUsers: Prisma.UserCreateInput[] = [
    {
      username: 'John',
      phoneNumber: '1234567890',
    },
    {
      username: 'Jane',
      phoneNumber: '0987654321',
    },
  ]

  console.log('Seeding users...')
  for (let user of defaultUsers) {
    await prisma.user.create({
      data: user,
    })

    console.log(`User ${user.username} created`)
  }
  console.log('Done seeding users')
}

Main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e: any) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
