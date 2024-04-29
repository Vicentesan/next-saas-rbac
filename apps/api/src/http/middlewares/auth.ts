import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

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
  })
})
