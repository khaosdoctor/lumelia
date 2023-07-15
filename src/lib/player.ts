import { isCharName, isTelegramUser } from '../types/guards.ts'
import type { CharName, MaybePlayer, PlayerId } from '../types/index.ts'

export function resolvePlayerId(player: MaybePlayer): CharName | PlayerId {
	if (isCharName(player)) return player
	else if (isTelegramUser(player)) return player.userId
	throw new Error(`Invalid player: ${player}`)
}
