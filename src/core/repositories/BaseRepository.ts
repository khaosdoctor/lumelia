export abstract class BaseRepository {
	constructor(protected readonly db: Deno.Kv) {}
}
