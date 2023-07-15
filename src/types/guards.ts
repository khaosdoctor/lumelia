import { CharName, PlayerId, TelegramUser } from '../core/entities/Player.ts'

export function isCharName(charName: unknown): charName is CharName {
	return typeof charName === 'string'
}

export function isTelegramUser(user: unknown): user is TelegramUser {
	return typeof user === 'object' && user !== null && 'userId' in user &&
		'name' in user
}
export function toPlayerId(id: number): PlayerId {
	return String(id) as PlayerId
}

export function toCharName(id: string): CharName {
	return String(id) as CharName
}
