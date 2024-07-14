import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function fetchProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/projects/',
      {
        schema: {
          tags: ['Project'],
          summary: 'List all organization projects',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              projects: z
                .object({
                  id: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  owner: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().url().nullable(),
                  }),
                  slug: z.string(),
                  logoUrl: z.string().url().nullable(),
                  name: z.string(),
                  description: z.string().nullable(),
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
        const {
          membership,
          organization: { id: organizationId },
        } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project'))
          throw new UnauthorizedError(
            `You're not allowed to see this organization projects`,
          )

        const projects = await prisma.project.findMany({
          where: {
            organizationId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            slug: true,
            logoUrl: true,
            name: true,
            description: true,
            createdAt: true,
          },
        })

        return res.status(200).send({ projects })
      },
    )
}
