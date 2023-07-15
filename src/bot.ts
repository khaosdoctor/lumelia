import { botCommands } from './commands/index.ts'
import { config } from './config.ts'
import { BalanceObject } from './core/Balance.ts'
import { HuntSession } from './core/parseHuntSession.ts'
import { Transaction } from './core/splitLoot.ts'
import { Bot, Context, session, SessionFlavor } from './deps.ts'
import { balancePaidHandler } from './handlers/balancePaid.ts'
import { clearBalanceHandler } from './handlers/clearBalance.ts'
import { getStorageAdapter } from './storage.ts'

// Aliases to make things easier to read
export type CharName = string & { __brand: 'CHAR' }
export type PlayerId = string & { __brand: 'PLAYER' }

export interface TelegramUser {
	name: string
	userId: PlayerId
}

export type MaybePlayer = TelegramUser | CharName

export interface BotSession {
	charsToPlayers: Record<CharName, TelegramUser>
	playersToChars: Record<PlayerId, CharName[]>
	balances: Record<
		PlayerId | CharName,
		Record<PlayerId | CharName, BalanceObject>
	>
	huntSessions: Record<HuntSession['sessionId'], HuntSession>
	transactions: Record<Transaction['transactionId'], Transaction>
	analytics: {
		totalPaid: Record<CharName, number>
		highestProfit: Record<CharName, { sessionId: HuntSession['sessionId'] }>
		lowestProfit: Record<CharName, number>
		sessionsRecorded: Record<CharName, number>
		totalPaidPerPlayer: Record<CharName, Record<CharName, number>>
	}
}
export type BotContext = Context & SessionFlavor<BotSession>

export const bot = new Bot<BotContext>(config.TELEGRAM_BOT_TOKEN)

bot.use(session({
	initial: () => ({
		charsToPlayers: {},
		playersToChars: {},
		balances: {},
		huntSessions: {},
		transactions: {},
		analytics: {
			totalPaid: {},
			sessionsRecorded: {},
			totalPaidPerPlayer: {},
			highestProfit: {},
			lowestProfit: {},
		},
	}),
	storage: await getStorageAdapter(config),
}))

await bot.api.setMyCommands(
	botCommands.map(({ command, description }) => ({
		command: `/${command}`,
		description,
	})),
)

for (const { command, handler } of botCommands) {
	bot.command(command, handler)
}

bot.callbackQuery(/clearBalance(\w*)/, clearBalanceHandler)
bot.callbackQuery(/balancePaid(.*):(.*)/, balancePaidHandler)
