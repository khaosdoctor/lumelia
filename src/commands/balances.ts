import { InlineKeyboard } from '../deps.ts'
import { BotContext } from '../bot.ts'
import {
	getAllBalances,
	getAllBalanceTexts,
} from '../helpers/balanceHelpers.ts'
import { isPlayerLinkedToAnyChar } from '../helpers/playerHelpers.ts'
import { userObjectFromMessage } from '../helpers/userObjectFromMessage.ts'

export async function listBalancesCommand(ctx: BotContext) {
	const balances = getAllBalances(ctx.session)
	const options: Record<string, unknown> = { parse_mode: 'MarkdownV2' }
	let balancesText =
		'No balances yet, use the /splitloot command to create some'

	if (balances.length > 0) {
		balancesText = getAllBalanceTexts(ctx.session).join('\n')
	}
	if (isPlayerLinkedToAnyChar(ctx.session, userObjectFromMessage(ctx))) {
		options.reply_markup = (new InlineKeyboard()).text(
			'👍 I paid',
			'balance_paid',
		)
	}
	await ctx.reply(`📝 *BALANCE LIST* \n\n ${balancesText}`, options)
}
