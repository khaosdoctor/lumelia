import { botCommands } from './commands/index.ts'
import { config } from './config.ts'
import { createRepositories, getStorageAdapter } from './core/repositories/mod.ts'
import { Bot, Context, session, SessionFlavor } from './deps.ts'
import { balancePaidHandler } from './commands/handlers/balancePaid.ts'
import { clearBalanceHandler } from './commands/handlers/clearBalance.ts'

export type BotSession = Record<string, unknown>
export type BotContext = Context & SessionFlavor<BotSession>

export const bot = new Bot<BotContext>(config.TELEGRAM_BOT_TOKEN)
const repositories = await createRepositories(config)
const commands = await botCommands(repositories)

bot.use(session({
	initial: () => ({}),
	storage: await getStorageAdapter(config),
}))

await bot.api.setMyCommands(
	commands.map(({ command, description }) => ({
		command: `/${command}`,
		description,
	})),
)

for (const { command, handler } of commands) {
	bot.command(command, handler)
}

bot.callbackQuery(/clearBalance(\w*)/, clearBalanceHandler)
bot.callbackQuery(/balancePaid(.*):(.*)/, balancePaidHandler)
bot.errorBoundary((err, next) => {
	console.error(`Error handling update`, err)
	return next()
})
