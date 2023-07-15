export type CharName = string & { __brand: 'CHAR' }
export type PlayerId = string & { __brand: 'PLAYER' }

export interface TelegramUser {
	name: string
	userId: PlayerId
}

export type UserOrChar = TelegramUser | CharName
