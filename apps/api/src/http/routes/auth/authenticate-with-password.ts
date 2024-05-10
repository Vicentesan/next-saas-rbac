import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with email and password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            jwtToken: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email: email.toLocaleLowerCase(),
        },
      })

      if (!userFromEmail) throw new UnauthorizedError('Invalid credentials.')

      if (userFromEmail.passwordHash === null)
        throw new UnauthorizedError(
          'User does not have a password, please use a social login.',
        )

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials.')

      const jwtToken = await res.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return res.status(201).send({ jwtToken })
    },
  )
}
