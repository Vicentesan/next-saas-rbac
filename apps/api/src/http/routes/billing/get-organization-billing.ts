import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_erros/unauthorized-error'

export async function getOrganizationBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/billing',
      {
        schema: {
          tags: ['Billing'],
          summary: 'Get billing details from organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              billing: z.object({
                seats: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                projects: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                total: z.number(),
              }),
            }),
          },
        },
      },
      async (req, res) => {
        const { slug } = req.params
        const { sub: userId } = await req.getCurrentUserId()
        const {
          organization: { id: organizationId },
          membership,
        } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Billing'))
          throw new UnauthorizedError(
            `You're not allowed to get billing details from this organization`,
          )

        const [amountOfMembers, amountOfProjects] = await Promise.all([
          prisma.member.count({
            where: {
              organizationId,
              role: { not: 'BILLING' },
            },
          }),

          prisma.project.count({
            where: {
              organizationId,
            },
          }),
        ])

        return res.status(200).send({
          billing: {
            seats: {
              amount: amountOfMembers,
              unit: 10,
              price: amountOfMembers * 10,
            },
            projects: {
              amount: amountOfProjects,
              unit: 20,
              price: amountOfProjects * 20,
            },
            total: amountOfMembers * 10 + amountOfProjects * 20,
          },
        })
      },
    )
}
