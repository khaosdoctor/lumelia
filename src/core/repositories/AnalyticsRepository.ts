import { BaseRepository } from './BaseRepository.ts'

export class AnalyticsRepository extends BaseRepository {
	constructor(protected readonly db: Deno.Kv) {
		super(db)
	}
}
