import { BaseRepository } from './mod.ts'

export class BalanceRepository extends BaseRepository {
	constructor(protected readonly db: Deno.Kv) {
		super(db)
	}
}
