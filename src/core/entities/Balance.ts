import { generateSnowflakeId } from '../../deps.ts'
import { makeUserLink } from '../../lib/telegramHelpers.ts'
import { toCharName } from '../../types/guards.ts'
import { BalanceOverpayError } from '../errors/BalanceOverpay.ts'
import { CharName, UserOrChar } from './Player.ts'

export type BalanceObject = ReturnType<Balance['toObject']>

export interface Transaction {
	transactionId: string
	sessionId: string
	from: CharName
	to: CharName
	amount: number
	note?: string
	timestamp: number
}

export interface BalanceHistory {
	amountPaid: number
	date: Date
	transactions?: Transaction[]
	notes?: string
}

export class Balance {
	readonly id: string
	from: UserOrChar
	fromChar: CharName = toCharName('')
	to: UserOrChar
	toChar: CharName = toCharName('')
	amount = 0
	#paid = false
	#transactions: Transaction[] = []
	#history: BalanceHistory[] = []

	static createFrom(balanceObject: BalanceObject) {
		const balance = new Balance(
			balanceObject.from,
			balanceObject.to,
			balanceObject.id,
		)
		balance.amount = balanceObject.amount
		balance.#paid = balanceObject.paid
		balance.#transactions = balanceObject.transactions
		balance.#history = balanceObject.history
		balance.fromChar = balanceObject.fromChar || balanceObject.transactions[0].from
		balance.toChar = balanceObject.toChar || balanceObject.transactions[0].to
		return balance
	}

	constructor(from: UserOrChar, to: UserOrChar, id?: string) {
		this.from = from
		this.to = to
		this.id = id || generateSnowflakeId({ processID: Deno.pid })
	}

	get sessionsIncluded() {
		return new Set(this.#transactions.map((transaction) => transaction.sessionId))
	}

	get isPaid() {
		return this.#paid
	}

	get transactions() {
		return this.#transactions
	}

	get history() {
		return this.#history
	}

	addTransaction(transaction: Transaction) {
		this.#transactions.push(transaction)
		this.#paid = false
		this.amount += transaction.amount
		return this
	}

	markAsPaid() {
		this.#history.push({
			amountPaid: this.amount,
			date: new Date(),
			transactions: this.#transactions,
			notes: 'Final Payment',
		})
		this.amount = 0
		this.#paid = true
		this.#transactions = []
		return this
	}

	pay(amount: number, transaction?: Transaction) {
		if (this.isPaid) return
		if (amount > this.amount) {
			throw new BalanceOverpayError(amount, this.amount)
		}

		this.amount -= amount
		this.history.push({
			amountPaid: amount,
			date: new Date(),
			notes: 'Partial Payment',
			transactions: transaction ? [transaction] : [],
		})

		if (this.amount <= 0) {
			this.markAsPaid()
		}

		return this
	}

	payAll() {
		this.pay(this.amount)
		return this
	}

	payAllFromSession(sessionId: string) {
		const summary = {
			transactions: [] as Transaction[],
			totalAmount: 0,
			balanceInstance: this,
		}

		for (const transaction of this.#transactions) {
			if (transaction.sessionId === sessionId) {
				this.pay(transaction.amount, transaction)
				summary.transactions.push(transaction)
				summary.totalAmount += transaction.amount
			}
		}

		this.#transactions = this.#transactions.filter((transaction) => transaction.sessionId !== sessionId)
		return summary
	}

	toObject() {
		return {
			id: this.id,
			from: this.from,
			fromChar: this.fromChar,
			to: this.to,
			toChar: this.toChar,
			amount: this.amount,
			paid: this.#paid,
			transactions: this.#transactions,
			history: this.#history,
		}
	}

	formatFromToCharName(type: 'from' | 'to') {
		switch (type) {
			case 'from':
				return this.from !== this.fromChar ? `\\(on ${this.fromChar}\\)` : ''
			case 'to':
				return this.to !== this.toChar ? `\\(on ${this.toChar}\\)` : ''
		}
	}

	toString() {
		console.log(this)
		return `\n👉 *${makeUserLink(this.from)} ${this.formatFromToCharName('from')}* owes *${makeUserLink(this.to)} ${
			this.formatFromToCharName('to')
		}* _${Intl.NumberFormat().format(this.amount)}_:\n\t\t💬: _\`transfer ${this.amount} to ${this.toChar}\`_`
	}
}
