import { roleSchema } from '@nivo/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_erros/bad-request-error'

export async function getInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/invites/:inviteId',
    {
      schema: {
        tags: ['Invite'],
        summary: 'Get invite details',
        params: z.object({
          slug: z.string(),
          inviteId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            invite: z.object({
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
            }),
          }),
        },
      },
    },
    async (req, res) => {
      const { inviteId } = req.params

      const invite = await prisma.invite.findUnique({
        where: {
          id: inviteId,
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

      if (!invite) throw new BadRequestError(`Invite not found`)

      return res.status(200).send({ invite })
    },
  )
}
