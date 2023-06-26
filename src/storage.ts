import { FileAdapter } from './deps.ts'
import type { Config } from './config.ts'
import { type ISession, MongoClient, MongoDBAdapter } from './deps.ts'
import type { BotSession } from './bot.ts'

export async function getStorageAdapter(config: Config) {
	if (config.DEV_MODE) {
		return new FileAdapter<BotSession>({
			dirName: '.botdata',
		})
	}

	const client = new MongoClient()
	await client.connect(config.DATABASE_CONNSTRING)
	const db = client.database('lumelia')
	const collection = db.collection<ISession>('sessions')
	return new MongoDBAdapter<BotSession>({
		collection,
	})
}
