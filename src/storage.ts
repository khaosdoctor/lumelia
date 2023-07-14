import { FileAdapter } from './deps.ts'
import type { Config } from './config.ts'
import type { BotSession } from './bot.ts'
import { DenoKVAdapter } from './deps.ts'

export async function getStorageAdapter(config: Config) {
	if (config.DEV_MODE) {
		return new FileAdapter<BotSession>({
			dirName: '.botdata',
		})
	}
	const kv = await Deno.openKv('./kv.db')
	return new DenoKVAdapter<BotSession>(kv)
}
