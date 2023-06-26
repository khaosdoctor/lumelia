import { BotContext } from '../bot.ts'
import { CommandContext } from '../deps.ts'

export async function iamCommand(ctx: CommandContext<BotContext>) {
	if (!ctx.message?.text || !ctx.message?.from.id) return

	const characterName = /\/iam (\w*)/gmi.exec(ctx.message.text)?.[1]?.trim()
	if (!characterName) {
		return ctx.reply('Invalid character name, specify a name after /iam')
	}

	const player = ctx.session.players[characterName]
	if (player) {
		await ctx.reply(
			`Character ${characterName} is already associated with ${player.name}, overwriting...`,
			{ reply_to_message_id: ctx.message.message_id },
		)
	}

	ctx.session.players[characterName] = {
		name: ctx.message.from.username || ctx.message.from.first_name,
		userId: ctx.message.from.id,
	}
	await ctx.reply(
		`Character ${characterName} is now associated with ${
			`@${ctx.message.from.username}` || ctx.message.from.first_name
		}`,
		{ reply_to_message_id: ctx.message.message_id },
	)
}
