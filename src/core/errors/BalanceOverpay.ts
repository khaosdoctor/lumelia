export class BalanceOverpayError extends Error {
	code = 'ERR_BALANCE_OVERPAY'

	constructor(public amountToPay: number, public balanceAmount: number) {
		super(`Cannot pay more than the balance`)
	}
}
