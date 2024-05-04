import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../routes/_erros/unauthorized-error'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (req) => {
    req.getCurrentUserId = async () => {
      try {
        const { sub } = await req.jwtVerify<{ sub: string }>()

        return { sub }
      } catch {
        throw new UnauthorizedError('Invalid auth Token')
      }
    }

    req.getUserMembership = async (slug: string) => {
      const { sub: userId } = await req.getCurrentUserId()

      const member = await prisma.member.findFirst({
        where: {
          userId,
          organization: {
            slug,
          },
        },
        include: {
          organization: true,
        },
      })

      if (!member)
        throw new UnauthorizedError(`You're not a member of this organization.`)

      const { organization, ...membership } = member

      return {
        organization,
        membership,
      }
    }
  })
})
