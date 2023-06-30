import { Context } from "../deps.ts"

export function userObjectFromMessage<C extends Context> (ctx: C) {
  if (ctx.from) {
    return {
      name: ctx.from.username || ctx.from.first_name,
      userId: ctx.from.id,
    }
  } else if (ctx.message && ctx.message.from) {
    return {
      name: ctx.message.from.username || ctx.message.from.first_name,
      userId: ctx.message.from.id,
    }
  }
  throw new Error('No user found in context')
}
