import { BotContext } from '../bot.ts'
import { Filter } from '../deps.ts'

type ClearBalanceResponseTypes = 'Yes' | 'No' | undefined

export async function balancePaidHandler (
	ctx: Filter<BotContext, 'callback_query'>,
) {
	const player = ctx.session.players[ctx.from.id]
	await ctx.answerCallbackQuery('Marking balance as paid...')
	//TODO: Mark balance as paid
}
