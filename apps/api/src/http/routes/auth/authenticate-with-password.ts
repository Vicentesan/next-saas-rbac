import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

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
      },
    },
    async (req, res) => {
      const { email, password } = req.body

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFromEmail)
        return res.status(401).send({ message: 'Invalid credentials.' })

      if (userFromEmail.passwordHash === null)
        return res.status(401).send({
          message: 'User does not have a password, please use a social login.',
        })

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid)
        return res.status(401).send({ message: 'Invalid credentials.' })

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
