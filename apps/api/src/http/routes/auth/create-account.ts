import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          400: z.object({
            message: z.string(),
          }),
          201: z.object({}),
        },
      },
    },
    async (req, res) => {
      const { name, email, password } = req.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail)
        return res
          .status(400)
          .send({ message: 'User with same email already exists.' })

      const [, domain] = email.split('@')

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      const hashedPassword = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          memberIn: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      })

      return res.status(201).send()
    },
  )
}
