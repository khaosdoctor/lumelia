import { BotContext } from '../bot.ts'
import { Balance } from '../core/Balance.ts'
import { parseHuntSession } from '../core/parseHuntSession.ts'
import { splitLoot } from '../core/splitLoot.ts'
import { IPaidButton } from '../helpers/buttons/IPaidButton.ts'
import { makeUserLink } from '../helpers/makeUserLink.ts'
import { findPlayerThatOwnsTheChar, getOutstandingBalance, setPlayerBalance } from '../helpers/playerHelpers.ts'

export async function splitLootCommand(ctx: BotContext) {
	const loadingMessage = await ctx.reply(
		'Splitting loot... One moment please 🤖',
	)
	const sessionText = ctx.message?.text?.split('/splitloot')[1]
	if (!sessionText) {
		return ctx.api.editMessageText(
			ctx.chat?.id!,
			loadingMessage.message_id!,
			'No session text provided, please send the session text after the command 😊',
		)
	}

	try {
		let parsedSession
		try {
			parsedSession = await parseHuntSession(sessionText)
		} catch (error) {
			console.error(`Error parsing session data`, { error })
			return ctx.api.editMessageText(
				ctx.chat?.id!,
				loadingMessage.message_id!,
				`⚠️ Error parsing session text, is this a valid session?`,
			)
		}

		const { session } = ctx
		const huntingSession = session.huntSessions[parsedSession.sessionId]
		if (huntingSession) {
			return ctx.api.editMessageText(
				ctx.chat?.id!,
				loadingMessage.message_id!,
				`👀 I already parsed this session before, use the /balances command to show the balance for all players`,
			)
		}
		session.huntSessions[parsedSession.sessionId] = parsedSession

		const transactions = splitLoot(parsedSession)
		if (!session.transactions) session.transactions = {}

		const balanceText = new Set<string>()
		balanceText.add(`*Session ${parsedSession.sessionId}*`)
		balanceText.add(`_this balance is only for this session, for a total list of balances use /balances_\n`)
		for (const transaction of transactions) {
			session.transactions[transaction.transactionId] = transaction
			const maybePlayer = findPlayerThatOwnsTheChar(session, transaction.from)
			const maybeReceiver = findPlayerThatOwnsTheChar(session, transaction.to)
			const outstandingBalance = getOutstandingBalance(session, maybePlayer, maybeReceiver) ||
				new Balance(maybePlayer, maybeReceiver)
			outstandingBalance.addTransaction(transaction)
			setPlayerBalance(session, outstandingBalance)
			balanceText.add(
				`👉 *${makeUserLink(maybePlayer)} ${outstandingBalance.formatFromToCharName('from')}* owes *${
					makeUserLink(maybeReceiver)
				} ${outstandingBalance.formatFromToCharName('to')}* ${
					Intl.NumberFormat().format(transaction.amount)
				}:\n\t💬: \`transfer ${transaction.amount} to ${transaction.to}\`\n`,
			)
		}

		ctx.deleteMessage()
		return ctx.api.editMessageText(
			ctx.chat?.id!,
			loadingMessage.message_id!,
			Array.from(balanceText.values()).join('\n'),
			{
				parse_mode: 'MarkdownV2',
				reply_markup: IPaidButton({ sessionId: parsedSession.sessionId, all: true }),
			},
		)
	} catch (error) {
		console.error(`Error splitting loot`, { error })
		return ctx.api.editMessageText(
			ctx.chat?.id!,
			loadingMessage.message_id!,
			`😞 Error splitting loot, please try again later`,
		)
	}
}
