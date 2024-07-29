import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function fetchMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members/',
      {
        schema: {
          tags: ['Member'],
          summary: 'List all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z
                .object({
                  userId: z.string().uuid(),
                  id: z.string().uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                })
                .array(),
            }),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()
        const { slug } = req.params
        const {
          membership,
          organization: { id: organizationId },
        } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User'))
          throw new UnauthorizedError(
            `You're not allowed to see this organization members`,
          )

        const members = await prisma.member.findMany({
          where: {
            organizationId,
          },
          orderBy: {
            role: 'asc',
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        })

        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
            }
          },
        )

        return res.status(200).send({ members: membersWithRoles })
      },
    )
}
