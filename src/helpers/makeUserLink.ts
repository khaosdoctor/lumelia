import { TelegramUser } from '../bot.ts'

export function makeUserLink(user: TelegramUser | string) {
	if (typeof user === 'string') return user
	return `[${user.name}](tg://user?id=${user.userId})`
}
