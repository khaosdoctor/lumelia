import { MaybePlayer } from "../bot.ts"
import { generateSnowflakeId } from "../deps.ts"
import { makeUserLink } from "../helpers/makeUserLink.ts"
import { Transaction } from "./splitLoot.ts"

export type Nullable<T> = T | null

export interface BalanceObject {
  id: string,
  from: MaybePlayer,
  to: MaybePlayer,
  amount: number,
  paid: boolean,
  transactions: Transaction[],
  history: BalanceHistory[],
}

export interface BalanceHistory {
  amountPaid: number
  date: Date
  transactions: Transaction[]
}

export class Balance {
  readonly id: string
  from: MaybePlayer
  to: MaybePlayer
  #amount = 0
  #paid = false
  #transactions: Transaction[] = []
  #history: BalanceHistory[] = []

  static createFrom (balanceObject: BalanceObject) {
    const balance = new Balance(balanceObject.from, balanceObject.to, balanceObject.id)
    balance.#amount = balanceObject.amount
    balance.#paid = balanceObject.paid
    balance.#transactions = balanceObject.transactions
    balance.#history = balanceObject.history
    return balance
  }

  constructor (from: MaybePlayer, to: MaybePlayer, id?: string) {
    this.from = from
    this.to = to
    this.id = id || generateSnowflakeId({ processID: Deno.pid })
  }

  get amount () {
    return this.#amount
  }

  get isPaid () {
    return this.#paid
  }

  get transactions () {
    return this.#transactions
  }

  get history () {
    return this.#history
  }

  addTransaction (transaction: Transaction) {
    this.#transactions.push(transaction)
    this.#paid = false
    this.#amount += transaction.amount
  }

  markAsPaid () {
    this.#history.push({
      amountPaid: this.#amount,
      date: new Date(),
      transactions: this.#transactions,
    })
    this.#amount = 0
    this.#paid = true
    this.#transactions = []
  }

  toObject (): BalanceObject {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      amount: this.#amount,
      paid: this.#paid,
      transactions: this.#transactions,
      history: this.#history,
    }
  }

  get fromChar () {
    return this.transactions[0].from
  }

  get toChar () {
    return this.transactions[0].to
  }

  #formatFromToCharName (type: 'from' | 'to') {
    switch (type) {
      case 'from':
        return this.from !== this.fromChar ? `\\(on ${this.fromChar}\\)` : ''
      case 'to':
        return this.to !== this.toChar ? `\\(on ${this.toChar}\\)` : ''
    }
  }

  toString () {
    return `\n👉 *${makeUserLink(this.from)} ${this.#formatFromToCharName('from')}* owes *${makeUserLink(this.to)} ${this.#formatFromToCharName('to')}* _${Intl.NumberFormat().format(this.#amount)}_:\n\t\t💬: _transfer ${this.#amount} to ${this.toChar}_`
  }
}
