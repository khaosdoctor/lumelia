import type { BotSession, CharName, MaybePlayer, PlayerId, TelegramUser } from '../bot.ts'
import { Balance } from '../core/Balance.ts'

export function toPlayerId(id: number): PlayerId {
	return String(id) as PlayerId
}

export function toCharName(id: string): CharName {
	return String(id) as CharName
}

export function resolvePlayerId(player: MaybePlayer): CharName | PlayerId {
	if (isCharName(player)) return player
	else if (isTelegramUser(player)) return player.userId
	throw new Error(`Invalid player: ${player}`)
}

export function setPlayerBalance(session: BotSession, balance: Balance) {
	const payerKey = isCharName(balance.from) ? balance.from : balance.from.userId
	const receiverKey = isCharName(balance.to) ? balance.to : balance.to.userId

	if (!session.balances[payerKey]) session.balances[payerKey] = {}
	session.balances[payerKey][receiverKey] = balance.toObject()
}

export function isPlayerLinkedToAnyChar(
	session: BotSession,
	player: TelegramUser,
) {
	const chars = session.playersToChars[player.userId]
	return chars?.length > 0
}

export function getOutstandingBalance(
	session: BotSession,
	from: MaybePlayer,
	to: MaybePlayer,
) {
	const payerKey: CharName | PlayerId = resolvePlayerId(from)
	const receiverKey: CharName | PlayerId = resolvePlayerId(to)

	const foundPlayerBalance = session.balances[payerKey]
	if (!foundPlayerBalance) return null

	const foundBalance = foundPlayerBalance[receiverKey]
	if (foundBalance) return Balance.createFrom(foundBalance)

	return null
}

export function getRemainingAmountToPayForPlayer(session: BotSession, from: MaybePlayer) {
	const balances = getAllPlayerBalances(session, from)
	if (!balances) return 0
	return balances.reduce((acc, balance) => acc + balance.amount, 0)
}

export function getAllPlayerBalances(session: BotSession, from: MaybePlayer) {
	const payerKey: CharName | PlayerId = resolvePlayerId(from)
	const foundPlayerBalance = session.balances[payerKey]
	if (!foundPlayerBalance) return []

	return Object.values(foundPlayerBalance).map(Balance.createFrom)
}

export function isCharName(charName: unknown): charName is CharName {
	return typeof charName === 'string'
}

export function isTelegramUser(user: unknown): user is TelegramUser {
	return typeof user === 'object' && user !== null && 'userId' in user &&
		'name' in user
}

/**
 * Find the player that owns the given character name.
 * @returns {string | TelegramUser} The player object that owns the character name, or the character name directly if no player is found.
 */
export function findPlayerThatOwnsTheChar(
	session: BotSession,
	charName: CharName,
) {
	const result = session.charsToPlayers[charName]
	if (!result) return charName
	return result
}

/**
 * Find the characters owned by the given player.
 * @returns {string[]} The character names owned by the player.
 */
export function findCharsOwnedByPlayer(
	session: BotSession,
	player: TelegramUser,
) {
	const result = session.playersToChars[String(player.userId) as PlayerId]
	if (!result) return []
	return result
}
