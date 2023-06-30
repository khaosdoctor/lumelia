import { BotSession } from "../bot.ts"
import { Balance } from "../core/Balance.ts"

export function getAllBalanceTexts (session: BotSession) {
  return getAllBalances(session).map((balance) => balance.toString())
}

export function getAllBalances (session: BotSession) {
  const balances = Object.values(session.balances).map((playerBalances) => Object.values(playerBalances))
  return balances.flat().map((balance) => Balance.createFrom(balance))
}
