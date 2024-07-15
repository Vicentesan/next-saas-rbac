import { roleSchema } from '@nivo/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function fetchInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/invites',
      {
        schema: {
          tags: ['Invite'],
          summary: 'List all invites',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              invites: z
                .object({
                  id: z.string().uuid(),
                  role: roleSchema,
                  email: z.string().email(),
                  author: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().nullable(),
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
        const { slug } = req.params
        const { membership, organization } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Invite'))
          throw new UnauthorizedError(
            `You're not allowed to get organization invites`,
          )

        const invites = await prisma.invite.findMany({
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            email: true,
            role: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
          },
        })

        return res.status(200).send({ invites })
      },
    )
}
