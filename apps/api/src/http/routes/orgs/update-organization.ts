import { organizationSchema } from '@nivo/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Update organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string().optional(),
            domain: z.string().nullish().optional(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (req, res) => {
        const { slug } = req.params

        const { sub: userId } = await req.getCurrentUserId()
        const { membership, organization } = await req.getUserMembership(slug)

        const { name, domain, shouldAttachUsersByDomain } = req.body

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authOrganization))
          throw new UnauthorizedError(
            `You're not allowed to update this organization.`,
          )

        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: {
              domain,
              slug: {
                not: slug,
              },
            },
          })

          if (organizationByDomain)
            throw new UnauthorizedError(
              'Another organization with same domain already exists.',
            )
        }

        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
          },
        })

        return res.status(204).send()
      },
    )
}
