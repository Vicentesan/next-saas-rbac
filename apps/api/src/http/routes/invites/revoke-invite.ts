import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_erros/bad-request-error'
import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/invites/:inviteId/revoke',
      {
        schema: {
          tags: ['Invite'],
          summary: 'Revoke invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            inviteId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()
        const { slug, inviteId } = req.params
        const {
          membership,
          organization: { id: organizationId },
        } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('revoke', 'Invite'))
          throw new UnauthorizedError(`You're not allowed to revoke invites`)

        const invite = await prisma.invite.findFirst({
          where: {
            id: inviteId,
            organizationId,
          },
        })

        if (!invite)
          throw new BadRequestError(`Invite not found or already accepted`)

        await prisma.invite.delete({
          where: {
            id: inviteId,
            // here we don't need to check for organizationId, because we already did it above
          },
        })

        return res.status(204).send()
      },
    )
}
