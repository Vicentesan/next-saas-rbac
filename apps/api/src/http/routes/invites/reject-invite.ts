import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_erros/bad-request-error'

export async function rejectInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/invites/:inviteId/reject',
      {
        schema: {
          tags: ['Invite'],
          summary: 'Reject organization invite',
          params: z.object({
            inviteId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()
        const { inviteId } = req.params

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
          },
        })

        if (!invite) throw new BadRequestError(`Invite not found or expired`)

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) throw new BadRequestError(`User not found`)

        if (invite.email !== user.email)
          throw new BadRequestError(`This invite belongs to another user`)

        await prisma.invite.delete({
          where: {
            id: inviteId,
          },
        })

        return res.status(204).send()
      },
    )
}
