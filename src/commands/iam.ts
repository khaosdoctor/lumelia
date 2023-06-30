import { BotContext, TelegramUser } from '../bot.ts'
import { Balance } from '../core/Balance.ts'
import { CommandContext } from '../deps.ts'
import { makeUserLink } from '../helpers/makeUserLink.ts'
import { toCharName } from '../helpers/playerHelpers.ts'
import { userObjectFromMessage } from '../helpers/userObjectFromMessage.ts'

export async function iamCommand(ctx: CommandContext<BotContext>) {
	if (!ctx.message?.text || !ctx.message?.from.id) return

	const characterName = /\/iam (.*)/gmi.exec(ctx.message.text)?.[1]?.trim()
	if (!characterName) {
		return ctx.reply('Invalid character name, specify a name after /iam')
	}

	const player = ctx.session.charsToPlayers[toCharName(characterName)]
	if (player) {
		await ctx.reply(
			`Character *${characterName}* is already associated with *${makeUserLink(player)}*, I cannot overwrite`,
			{ reply_to_message_id: ctx.message.message_id, parse_mode: 'MarkdownV2' },
		)
		return
	}

	// Associate users to chars and chars to users
	const telegramUser: TelegramUser = userObjectFromMessage(ctx)
	ctx.session.charsToPlayers[toCharName(characterName)] = telegramUser

	const playerCharacters = ctx.session.playersToChars[telegramUser.userId]
	if (!playerCharacters) ctx.session.playersToChars[telegramUser.userId] = [toCharName(characterName)]
	else if (!playerCharacters.includes(toCharName(characterName))) playerCharacters.push(toCharName(characterName))

	await ctx.reply(
		`Character *${characterName}* is now associated with ${
			`@${ctx.message.from.username}` || ctx.message.from.first_name
		}`,
		{ reply_to_message_id: ctx.message.message_id, parse_mode: 'MarkdownV2' },
	)

	// Go through outstanding balances and update the payer/receiver names
	for (const playerName of Object.keys(ctx.session.balances)) {
		if (playerName === characterName) {
			// if it's their own balance, just copy the balance to the new ID and delete the previous one
			ctx.session.balances[telegramUser.userId] = ctx.session.balances[toCharName(playerName)]
			delete ctx.session.balances[toCharName(playerName)]
			const playerBalances = ctx.session.balances[telegramUser.userId]

			// then go through all the balances in the new user and update the payer name on balance.from
			const receivingPlayers: string[] = Object.keys(ctx.session.balances[telegramUser.userId])
			for (const receivingPlayer of receivingPlayers) {
				const balance = Balance.createFrom(playerBalances[toCharName(receivingPlayer)])
				balance.from = telegramUser
				playerBalances[toCharName(receivingPlayer)] = balance.toObject()
			}
			continue
		}

		const involvedPlayers: string[] = Object.keys(ctx.session.balances[toCharName(playerName)])
		for (const involvedPlayerName of involvedPlayers) {
			if (involvedPlayerName === characterName) {
				// if it's a balance they're involved in, update the player name on the key and delete the previous one
				ctx.session.balances[toCharName(playerName)][telegramUser.userId] =
					ctx.session.balances[toCharName(playerName)][toCharName(involvedPlayerName)]
				delete ctx.session.balances[toCharName(playerName)][toCharName(involvedPlayerName)]

				// then go through all the balances in the new user and update the player name on balance.to
				const involvedPlayerBalance = Balance.createFrom(ctx.session.balances[toCharName(playerName)][telegramUser.userId])
				involvedPlayerBalance.to = telegramUser
				ctx.session.balances[toCharName(playerName)][telegramUser.userId] = involvedPlayerBalance.toObject()
			}
		}
	}


	console.info(`This is my character to player mapping: ${JSON.stringify(ctx.session.charsToPlayers, null, 2)}`)
	console.info(`This is my player to char mapping: ${JSON.stringify(ctx.session.playersToChars, null, 2)}`)
}
