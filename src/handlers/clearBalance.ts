import { BotContext } from '../bot.ts'
import { Filter } from '../deps.ts'

type ClearBalanceResponseTypes = 'Yes' | 'No' | undefined

export async function clearBalanceHandler(
	ctx: Filter<BotContext, 'callback_query'>,
) {
	if (!ctx.match) return
	const response = ctx.match[1] as unknown as ClearBalanceResponseTypes
	if (response && response === 'Yes') {
		await ctx.answerCallbackQuery('Clearing balances...')
		ctx.session.balances = {}
		await ctx.editMessageText(
			`💸 Balances cleared by [${
				ctx.from.username || ctx.from.first_name
			}](tg://user?id=${ctx.from.id}) on ${new Date().toLocaleString('en-US')}`,
			{ parse_mode: 'MarkdownV2' },
		)
	}

	if (response && response === 'No') {
		await ctx.answerCallbackQuery('Action canceled.')
		ctx.session.balances = {}
		await ctx.deleteMessage()
	}
}
