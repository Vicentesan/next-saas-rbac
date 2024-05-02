import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from './routes/_erros/bad-request-error'
import { UnauthorizedError } from './routes/_erros/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (err, req, res) => {
  if (err instanceof ZodError)
    return res
      .status(400)
      .send({ message: 'Validation error', erros: err.flatten().fieldErrors })

  if (err instanceof BadRequestError)
    return res.status(400).send({ message: err.message })

  if (err instanceof UnauthorizedError)
    return res.status(401).send({ message: err.message })

  // send error to some observability service
  console.error(err)

  return res.send(500).send({ message: 'Internal Server Error' })
}
