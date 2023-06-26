import { BotContext } from '../bot.ts'
import { InlineKeyboard } from '../deps.ts'

export async function clearBalanceCommand(ctx: BotContext) {
	await ctx.reply(
		'Are you sure you want to clear all balances? This action cannot be undone.',
		{
			reply_markup: (new InlineKeyboard()).text('Yes', 'clearBalanceYes').text(
				'No',
				'clearBalanceNo',
			),
		},
	)
}
