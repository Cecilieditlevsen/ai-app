import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { person } from '@/db/schema/person'
import { publicProcedure, router } from '@/lib/trpc'
import { TRPCError } from '@trpc/server'

export const personRouter = router({
  // Get all persons
  getAll: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/perosns' } })
    .output(z.array(z.object({ name: z.string(), id: z.number() })))
    .query(async () => {
      try {
        const persons = await db.select().from(person)
        return persons
      } catch (error) {
        console.error('Error fetching all persons:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch persons',
        })
      }
    }),

  // Get a single person by ID
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    try {
      const result = await db.select().from(person).where(eq(person.id, input.id))

      const foundPerson = result[0]

      if (!foundPerson) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Person with ID ${input.id} not found`,
        })
      }

      return foundPerson
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error(`Error fetching person with ID ${input.id}:`, error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch person',
      })
    }
  }),
})
