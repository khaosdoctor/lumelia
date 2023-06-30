import { BotContext, TelegramUser } from '../bot.ts'
import { CommandContext } from '../deps.ts'
import { userObjectFromMessage } from '../helpers/userObjectFromMessage.ts'

export async function iamCommand(ctx: CommandContext<BotContext>) {
	if (!ctx.message?.text || !ctx.message?.from.id) return

	const characterName = /\/iam (\w*)/gmi.exec(ctx.message.text)?.[1]?.trim()
	if (!characterName) {
		return ctx.reply('Invalid character name, specify a name after /iam')
	}

	const player = ctx.session.charsToPlayers[characterName]
	if (player) {
		await ctx.reply(
			`Character ${characterName} is already associated with ${player.name}, overwriting...`,
			{ reply_to_message_id: ctx.message.message_id },
		)
	}

	const telegramUser: TelegramUser = userObjectFromMessage(ctx)
	ctx.session.charsToPlayers[characterName] = telegramUser

	const playerCharacters = ctx.session.playersToChars[telegramUser.name]
	if (!playerCharacters) ctx.session.playersToChars[telegramUser.userId] = [characterName]
	else if (!playerCharacters.includes(characterName)) playerCharacters.push(characterName)

	await ctx.reply(
		`Character ${characterName} is now associated with ${
			`@${ctx.message.from.username}` || ctx.message.from.first_name
		}`,
		{ reply_to_message_id: ctx.message.message_id },
	)

	await ctx.reply(`This is my character to player mapping: \`\`\`${JSON.stringify(ctx.session.charsToPlayers, null, 2)}\`\`\``, {
		parse_mode: 'MarkdownV2',
		reply_to_message_id: ctx.message.message_id,
	})
	await ctx.reply(`This is my player to char mapping: \`\`\`${JSON.stringify(ctx.session.playersToChars, null, 2)}\`\`\``, {
		parse_mode: 'MarkdownV2',
		reply_to_message_id: ctx.message.message_id,
	})
}
