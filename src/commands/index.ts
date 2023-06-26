import { BotCommand } from 'https://deno.land/x/grammy@v1.10.1/platform.deno.ts'
import { BotContext } from '../bot.ts'
import { CommandMiddleware } from 'https://deno.land/x/grammy@v1.10.1/mod.ts'
import { iamCommand } from './iam.ts'
import { listBalancesCommand } from './balances.ts'
import { clearBalanceCommand } from './clearBalance.ts'

export const botCommands:
	(BotCommand & { handler: CommandMiddleware<BotContext> })[] = [
		{
			command: 'ping',
			description: 'Asserts the bot is working',
			handler: (ctx: BotContext) => ctx.reply('pong!'),
		},
		{
			command: 'iam',
			description: 'Registers a user to a character',
			handler: iamCommand,
		},
		{
			command: 'balances',
			description: 'Lists all outstanding balances',
			handler: listBalancesCommand,
		},
		{
			command: 'clearbalance',
			description: 'Clears all balances from group',
			handler: clearBalanceCommand,
		},
		{
			command: 'splitloot',
			description: 'Splits the session loot evenly and adds it to the balances',
			handler: listBalancesCommand,
		},
	]
