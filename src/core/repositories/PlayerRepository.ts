import { BaseRepository } from './mod.ts'

export class PlayerRepository extends BaseRepository {
	constructor(protected readonly db: Deno.Kv) {
		super(db)
	}
}
