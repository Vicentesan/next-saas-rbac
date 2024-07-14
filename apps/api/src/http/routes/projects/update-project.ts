import { projectSchema } from '@nivo/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_erros/bad-request-error'
import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/projects/:projectId',
      {
        schema: {
          tags: ['Project'],
          summary: 'Update a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            projectId: z.string().uuid(),
          }),
          body: z.object({
            name: z.string(),
            description: z.string().nullable(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()
        const { slug, projectId } = req.params
        const {
          membership,
          organization: { id: organizationId },
        } = await req.getUserMembership(slug)

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            organizationId,
          },
        })

        if (!project) throw new BadRequestError('Project not found')

        const { cannot } = getUserPermissions(userId, membership.role)
        const authProject = projectSchema.parse(project)

        if (cannot('update', authProject))
          throw new UnauthorizedError(
            `You're not allowed to update this project`,
          )

        const { name, description } = req.body

        await prisma.project.update({
          where: {
            id: projectId,
          },
          data: {
            name,
            description,
          },
        })

        return res.status(204).send()
      },
    )
}
