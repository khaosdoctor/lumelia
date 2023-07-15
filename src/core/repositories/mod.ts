import type { BotSession } from './../../bot.ts'
import type { Config } from './../../config.ts'
import { AnalyticsRepository } from './AnalyticsRepository.ts'
import { PlayerRepository } from './PlayerRepository.ts'
import { BalanceRepository } from './BalanceRepository.ts'
import { DenoKVAdapter } from './../../deps.ts'

export abstract class BaseRepository {
	constructor(protected readonly db: Deno.Kv) {}
}
export type RepositoryList = Awaited<ReturnType<typeof createRepositories>>

export async function getDB(config: Config) {
	const db = config.DEV_MODE ? './kv.db' : ''
	const kv = await Deno.openKv(db)
	return kv
}

export async function getStorageAdapter(config: Config) {
	const db = await getDB(config)
	return new DenoKVAdapter<BotSession>(db)
}

export async function createRepositories(config: Config) {
	const db = await getDB(config)

	return {
		Player: new PlayerRepository(db),
		Balance: new BalanceRepository(db),
		Analytics: new AnalyticsRepository(db),
	}
}
