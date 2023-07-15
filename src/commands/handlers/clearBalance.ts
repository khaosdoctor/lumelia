import { BotContext } from '../../bot.ts'
import { Filter } from '../../deps.ts'

type ClearBalanceResponseTypes = 'Yes' | 'No' | undefined

export async function clearBalanceHandler(
	ctx: Filter<BotContext, 'callback_query'>,
) {
	if (!ctx.match) return
	const response = ctx.match[1] as unknown as ClearBalanceResponseTypes
	if (response && response === 'Yes') {
		await ctx.answerCallbackQuery('Clearing balances...')
	}

	if (response && response === 'No') {
		await ctx.answerCallbackQuery('Action canceled.')
		await ctx.deleteMessage()
	}
}
