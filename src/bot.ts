import { Bot, Context, session, SessionFlavor } from './deps.ts'
import { config } from './config.ts'
import { getStorageAdapter } from './storage.ts'
import { botCommands } from './commands/index.ts'
import { clearBalanceHandler } from './handlers/clearBalance.ts'
import { balancePaidHandler } from "./handlers/balancePaid.ts"

export interface BotSession {
  players: Record<string, { name: string; userId: number }>
  balances: Record<string, number>
}
export type BotContext = Context & SessionFlavor<BotSession>

export const bot = new Bot<BotContext>(config.TELEGRAM_BOT_TOKEN)

bot.use(session({
  initial: () => ({ players: {}, balances: {} }),
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
