import { roleSchema } from '@nivo/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_erros/bad-request-error'

export async function getPendingInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/pending-invites',
      {
        schema: {
          tags: ['Invite'],
          summary: 'Get all user pending invites',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              invites: z
                .object({
                  id: z.string().uuid(),
                  role: roleSchema,
                  email: z.string().email(),
                  organization: z.object({
                    name: z.string(),
                  }),
                  author: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().nullable(),
                      avatarUrl: z.string().url().nullable(),
                    })
                    .nullable(),
                  createdAt: z.date(),
                })
                .array(),
            }),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) throw new BadRequestError(`User not found`)

        const invites = await prisma.invite.findMany({
          where: {
            email: user.email,
          },
          select: {
            id: true,
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
            email: true,
            role: true,
            createdAt: true,
          },
        })

        return res.status(200).send({ invites })
      },
    )
}
