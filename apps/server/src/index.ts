import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { db } from '@/db'
import { person } from '@/db/schema/person'
import { swaggerUI } from '@hono/swagger-ui'

// Define your schemas
export const PersonSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const PersonsResponseSchema = z.array(PersonSchema)

export const PersonIdParamSchema = z.object({
  id: z.number(),
})

const app = new Hono()
const personApi = new OpenAPIHono()

// Get all persons
const getAllPersonsRoute = createRoute({
  method: 'get',
  path: '/persons',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonsResponseSchema,
        },
      },
      description: 'List of all persons',
    },
    500: {
      description: 'Internal server error',
    },
  },
  tags: ['persons'],
  summary: 'Get all persons',
})

personApi.openapi(getAllPersonsRoute, async (c) => {
  try {
    const persons = await db.select().from(person)
    return c.json(persons)
  } catch (error) {
    console.error('Error fetching all persons:', error)
    return c.json({ error: 'Failed to fetch persons' }, 500)
  }
})

app.use(logger())
app.use(
  '/*',
  cors({
    origin: process.env.CORS_ORIGIN || '',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

// Mount the person API routes
app.route('/api', personApi)

// Add Swagger UI
app.get('/docs', swaggerUI({ url: '/api/doc' }))

personApi.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Person API',
    version: '1.0.0',
    description: 'API for managing persons',
  },
  servers: [
    {
      url: '/api',
      description: 'API server',
    },
  ],
})

// app.use(
//   '/trpc/*',
//   trpcServer({
//     router: appRouter,
//     createContext: (_opts, context) => {
//       return createContext({ context })
//     },
//   }),
// )

app.post('/ai', async (c) => {
  const body = await c.req.json()
  const messages = body.messages || []

  const result = streamText({
    model: google('gemini-2.5-flash-preview-04-17'),
    messages,
  })

  c.header('X-Vercel-AI-Data-Stream', 'v1')
  c.header('Content-Type', 'text/plain; charset=utf-8')

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  })
})

app.get('/', (c) => {
  return c.text('OK')
})

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return JSON.stringify(error)
}

export default app
