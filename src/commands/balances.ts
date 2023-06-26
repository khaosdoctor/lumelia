import { InlineKeyboard } from '../deps.ts'
import { BotContext } from '../bot.ts'

export async function listBalancesCommand (ctx: BotContext) {
  const balances = Object.entries(ctx.session.balances)
  const balancesText = balances.length
    ? balances.map(([player, balance]) => `${player}: ${balance}`).join('\n')
    : 'No balances yet'

  let options = {}
  if (balancesText !== 'No balances yet, use the /splitloot command to create some') {
    options = {
      reply_markup: (new InlineKeyboard()).text('👍 I paid', 'balance_paid'),
    }
  }
  await ctx.reply(balancesText, options)
}
