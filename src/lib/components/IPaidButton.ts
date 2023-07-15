import { InlineKeyboard } from '../../deps.ts'

export const IPaidButton = (options?: { balanceId?: string; sessionId?: string }, suffix = '') => {
	const query = [options?.balanceId || 0, options?.sessionId || 0].join(':')
	return (new InlineKeyboard()).text(
		`👍 I paid ${suffix}`,
		`balancePaid${query}`,
	)
}
