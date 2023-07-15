import { BaseRepository } from './BaseRepository.ts'

export class BalanceRepository extends BaseRepository {
	constructor(protected readonly db: Deno.Kv) {
		super(db)
	}
}
