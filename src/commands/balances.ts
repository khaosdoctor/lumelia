import { BotContext } from '../bot.ts'
import { getAllBalances, getAllBalanceTexts } from '../helpers/balanceHelpers.ts'
import { IPaidButton } from '../helpers/buttons/IPaidButton.ts'

export async function listBalancesCommand(ctx: BotContext) {
	const balances = getAllBalances(ctx.session).filter((b) => !b.isPaid)
	const options: Record<string, unknown> = { parse_mode: 'MarkdownV2' }
	let balancesText = 'No unpaid balances yet, use the /splitloot command to create some'

	if (balances.length > 0) {
		balancesText = getAllBalanceTexts(ctx.session).join('\n')
		options.reply_markup = IPaidButton()
	}

	await ctx.reply(`📝 *BALANCE LIST* \n\n ${balancesText}`, options)
}
