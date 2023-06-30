import { botCommands } from './commands/index.ts'
import { config } from './config.ts'
import { HuntSession } from './core/parseHuntSession.ts'
import { Transaction } from "./core/splitLoot.ts"
import { Bot, Context, session, SessionFlavor } from './deps.ts'
import { balancePaidHandler } from "./handlers/balancePaid.ts"
import { clearBalanceHandler } from './handlers/clearBalance.ts'
import { getStorageAdapter } from './storage.ts'

export interface TelegramUser {
  name: string
  userId: number
}

export interface Balance {
  from: TelegramUser
  to: TelegramUser
  amount: number
  paid: boolean
  transactions: Transaction[]
}

export interface BotSession {
  charsToPlayers: Record<string, TelegramUser>
  playersToChars: Record<string, string[]>
  balances: Record<string, Balance[]>
  huntSessions: Record<string, HuntSession>
  transactions: Record<string, Transaction>
}
export type BotContext = Context & SessionFlavor<BotSession>

export const bot = new Bot<BotContext>(config.TELEGRAM_BOT_TOKEN)

bot.use(session({
  initial: () => ({ charsToPlayers: {}, playersToChars: {}, balances: {}, huntSessions: {}, transactions: {} }),
  storage: await getStorageAdapter(config),
}))

bot.api.setMyCommands(
  botCommands.map(({ command, description }) => ({
    command: `/${command}`,
    description,
  })),
)

for (const { command, handler } of botCommands) {
  bot.command(command, handler)
}

bot.callbackQuery(/clearBalance(\w*)/, clearBalanceHandler)
bot.callbackQuery('balance_paid', balancePaidHandler)
