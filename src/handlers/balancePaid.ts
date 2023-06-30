import { BotContext } from '../bot.ts'
import { Filter } from '../deps.ts'

type ClearBalanceResponseTypes = 'Yes' | 'No' | undefined

export async function balancePaidHandler(
	ctx: Filter<BotContext, 'callback_query'>,
) {
	const chars = ctx.session.playersToChars[ctx.from.id]
	if (!chars || chars.length === 0) {
		await ctx.answerCallbackQuery('You are not part of this hunt.')
		return
	}

	if (chars.length > 1) {
		await ctx.answerCallbackQuery(
			'You have multiple characters registered in your name. Please specify which one you want to mark as paid.',
		)
		return
	}
	await ctx.answerCallbackQuery('Marking balance as paid...')
}
