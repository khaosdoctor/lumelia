import { BotContext } from '../bot.ts'
import { RepositoryList } from '../core/repositories/mod.ts'
import { listBalancesCommandFactory } from './balances.ts'
import { charListCommandFactory } from './charList.ts'
import { clearBalanceCommandFactory } from './clearBalance.ts'
import { iamCommandFactory } from './iAm.ts'
import { iamNotCommandFactory } from './iAmNot.ts'
import { infoCommandFactory } from './info.ts'
import { settleCommandFactory } from './settle.ts'
import { splitLootCommandFactory } from './splitLoot.ts'

export const botCommands = async (repositories: RepositoryList) => [
	{
		command: 'ping',
		description: 'Asserts the bot is working',
		handler: (ctx: BotContext) => ctx.reply('pong!'),
	},
	{
		command: 'iam',
		description: 'Registers a user to a character',
		handler: await iamCommandFactory(repositories),
	},
	{
		command: 'iamnot',
		description: 'De-registers a user from a character',
		handler: await iamNotCommandFactory(repositories),
	},
	{
		command: 'charlist',
		description: 'Shows all the users and their characters',
		handler: await charListCommandFactory(repositories),
	},
	{
		command: 'balances',
		description: 'Lists all outstanding balances',
		handler: await listBalancesCommandFactory(repositories),
	},
	{
		command: 'clearbalance',
		description: 'Clears all balances from group',
		handler: await clearBalanceCommandFactory(repositories),
	},
	{
		command: 'splitloot',
		description: 'Splits the session loot evenly and adds it to the balances',
		handler: await splitLootCommandFactory(repositories),
	},
	{
		command: 'settle',
		description: 'Registers a payment from a player that is not linked to any char',
		handler: await settleCommandFactory(repositories),
	},
	{
		command: 'info',
		description: 'Shows info on the chat or user statistics',
		handler: await infoCommandFactory(repositories),
	},
]
