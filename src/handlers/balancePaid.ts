import { BotContext, TelegramUser } from '../bot.ts'
import { Filter } from '../deps.ts'
import { makeUserLink } from '../helpers/makeUserLink.ts'
import {
	findCharsOwnedByPlayer,
	getAllPlayerBalances,
	getRemainingAmountToPayForPlayer,
	setPlayerBalance,
} from '../helpers/playerHelpers.ts'
import { userObjectFromMessage } from '../helpers/userObjectFromMessage.ts'

export async function balancePaidHandler(
	ctx: Filter<BotContext, 'callback_query'>,
) {
	const balanceId = ctx?.match?.at(1) || null
	const sessionId = ctx?.match?.at(2) || null
	const player = userObjectFromMessage(ctx)
	const chars = findCharsOwnedByPlayer(ctx.session, player)

	if (!chars || chars.length === 0) {
		await ctx.reply(
			`${
				makeUserLink(player)
			}, you are not part of this hunt, or you have no characters registered\\. Use the /iam command to register your characters\\.`,
			{ parse_mode: 'MarkdownV2' },
		)
		return
	}

	if (chars.length > 1 && !sessionId) {
		await ctx.answerCallbackQuery(
			'You have multiple characters registered in your name. Please specify which one you want to mark as paid.',
		)
		return
	}

	try {
		const loadingMessage = await ctx.reply(`${makeUserLink(player)} started a settle up`, { parse_mode: 'MarkdownV2' })
		// If it has a session ID it means it's a balance from a specific session
		// from /splitloot
		if (sessionId) return payBalanceForOneSession(ctx, player, sessionId, loadingMessage)
		if (balanceId) return 'should pay for only a single balance'
		return 'pay all outstanding balances for player'
	} catch (err) {
		console.error(err)
	}
}

async function payBalanceForOneSession(
	ctx: Filter<BotContext, 'callback_query'>,
	player: TelegramUser,
	sessionId: string,
	loadingMessage: Awaited<ReturnType<BotContext['reply']>>,
) {
	const summaries = getAllPlayerBalances(ctx.session, player)
		.map((b) => b.payAllFromSession(sessionId))

	for (const summary of summaries) {
		setPlayerBalance(ctx.session, summary.balanceInstance)
	}

	const totalPaid = summaries.reduce((acc, b) => acc + b.totalAmount, 0)

	if (totalPaid === 0) {
		await ctx.api.deleteMessage(ctx.chat?.id!, loadingMessage.message_id!)
		return ctx.answerCallbackQuery(
			`✅ You don't have anything else to pay`,
		)
	}

	await ctx.api.editMessageText(
		ctx.chat?.id!,
		loadingMessage.message_id!,
		`👍 ${makeUserLink(player)} paid all from session:

*🏦 Total Paid:* ${Intl.NumberFormat().format(totalPaid)}
*📈 Details:*
${
			summaries.map(({ transactions }) => {
				return transactions.map((t) => `👉 *${t.from}* ➡️ *${t.to}*: ${Intl.NumberFormat().format(t.amount)}`).join(
					'\n',
				)
			}).join('\n')
		}\n
			*🤑 Remaining balances for you:* ${
			Intl.NumberFormat().format(getRemainingAmountToPayForPlayer(ctx.session, player))
		}`,
		{ parse_mode: 'MarkdownV2' },
	)
}
