import { InlineKeyboard } from '../deps.ts'
import { BotContext } from '../bot.ts'
import { makeUserLink } from '../helpers/makeUserLink.ts'

export async function listBalancesCommand (ctx: BotContext) {
  const players = Object.keys(ctx.session.balances)
  let options = {}
  let balancesText = 'No balances yet, use the /splitloot command to create some'

  if (players.length > 0) {
    balancesText = players.map((userId) => {
      const balances = ctx.session.balances[userId]
      const player = ctx.session.charsToPlayers[userId]
      const playerName = makeUserLink(player)
      const balancesText = balances.map(({ from, amount, to }) => {
        const fromLink = makeUserLink(from)
        return `- **${fromLink}** owes *${amount}* to **${makeUserLink(to)}**`
      }).join('\n')
      return `**${playerName}**:\n${balancesText}`
    }).join('\n=== === ===\n')

    options = {
      reply_markup: (new InlineKeyboard()).text('👍 I paid', 'balance_paid'),
      parseMode: 'MarkdownV2',
    }
  }

  await ctx.reply(balancesText, options)
}
