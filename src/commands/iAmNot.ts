import { BotContext } from '../bot.ts'
import { RepositoryList } from '../core/repositories/mod.ts'
import { CommandContext } from '../deps.ts'

export async function iamNotCommandFactory(repositories: RepositoryList) {
	return async (ctx: CommandContext<BotContext>) => {
	}
}
