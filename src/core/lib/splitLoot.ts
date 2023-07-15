import { toCharName } from '../../types/guards.ts'
import { Transaction } from '../entities/Balance.ts'
import type { HuntSession } from './parseHuntSession.ts'

/**
 * Split loot between players fairly and return a list of transactions.
 *
 * This algorithm favors larger transfers: the player with the largest negative
 * balance will receive the largest transfer from the player with the largest
 * positive balance first, then the balance will be recalculated and the
 * process will repeat until all balances are neutral.
 */
export const splitLoot = ({
	balance,
	players,
	sessionId,
}: HuntSession) => {
	const balancePerPlayer = Math.floor(balance / players.length)
	const state = players.map(({ name, balance }) => ({
		name,
		balance: balance - balancePerPlayer,
	}))

	const transactions: Transaction[] = []

	state.sort((a, b) => a.balance - b.balance)
	while (state[0].balance < 0) {
		const amount = Math.min(-state[0].balance, state[state.length - 1].balance)

		state[0].balance += amount
		state[state.length - 1].balance -= amount

		transactions.push({
			transactionId: `${sessionId}-${transactions.length}`,
			sessionId,
			from: toCharName(state[state.length - 1].name),
			to: toCharName(state[0].name),
			amount,
			note: `split loot from session ${sessionId}`,
			timestamp: Date.now(),
		})

		state.sort((a, b) => a.balance - b.balance)
	}

	return transactions.sort((a, b) => a.from.localeCompare(b.from, 'us', { sensitivity: 'base' }))
}
