import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'
import type { OpenApiMeta } from 'trpc-to-openapi'

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create()

export const router = t.router

export const publicProcedure = t.procedure
