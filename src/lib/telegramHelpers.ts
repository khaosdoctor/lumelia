import { TelegramUser } from '../types/index.ts'

export function makeUserLink(user: TelegramUser | string) {
	if (typeof user === 'string') return user
	return `[${user.name}](tg://user?id=${user.userId})`
}
