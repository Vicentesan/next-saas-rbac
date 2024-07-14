import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_erros/bad-request-error'
import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['Project'],
          summary: 'Get project details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            200: z.object({
              project: z.object({
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
              }),
            }),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()
        const { orgSlug, projectSlug } = req.params
        const {
          membership,
          organization: { id: organizationId },
        } = await req.getUserMembership(orgSlug)

        const project = await prisma.project.findUnique({
          where: {
            slug: projectSlug,
            organizationId,
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
          },
        })

        if (!project) throw new BadRequestError('Project not found')

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project'))
          throw new UnauthorizedError(`You're not allowed to see this project`)

        return res.status(200).send({ project })
      },
    )
}
