import { roleSchema } from '@nivo/auth/src/roles'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/membership',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Get user membership on organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.string().uuid(),
                organizationId: z.string().uuid(),
                role: roleSchema,
              }),
            }),
          },
        },
      },
      async (req) => {
        const { slug } = req.params
        const { membership } = await req.getUserMembership(slug)

        return {
          membership: {
            id: membership.id,
            organizationId: membership.organizationId,
            role: membership.role,
          },
        }
      },
    )
}
