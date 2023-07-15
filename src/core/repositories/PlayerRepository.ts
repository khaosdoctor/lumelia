import { BaseRepository } from './BaseRepository.ts'

export class PlayerRepository extends BaseRepository {
	constructor(protected readonly db: Deno.Kv) {
		super(db)
	}
}
