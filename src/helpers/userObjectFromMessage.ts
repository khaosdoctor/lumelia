import { TelegramUser } from "../bot.ts"
import { Context } from "../deps.ts"
import { toPlayerId } from "./playerHelpers.ts";

export function userObjectFromMessage<C extends Context> (ctx: C): TelegramUser {
  if (ctx.from) {
    return {
      name: ctx.from.username || ctx.from.first_name,
      userId: toPlayerId(ctx.from.id),
    }
  } else if (ctx.message && ctx.message.from) {
    return {
      name: ctx.message.from.username || ctx.message.from.first_name,
      userId: toPlayerId(ctx.message.from.id),
    }
  }
  throw new Error('No user found in context')
}
