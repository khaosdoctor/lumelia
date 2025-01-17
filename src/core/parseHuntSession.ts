import { crypto, toHashString } from '../deps.ts'

export type HuntSession = Awaited<ReturnType<typeof parseHuntSession>>

const chunk = <T>(inputArray: T[], perChunk: number) =>
	inputArray.reduce((resultArray: Array<T[]>, item, index) => {
		const chunkIndex = Math.floor(index / perChunk)
		resultArray[chunkIndex] = ([] as T[]).concat(
			resultArray[chunkIndex] || [],
			item,
		)
		return resultArray
	}, [] as Array<T[]>)

const parseDuration = (line: string): number => {
	const [, hours, minutes] = line.replace('h', '').split(':')
	return Number(hours) * 60 + Number(minutes)
}

const parseNumberLine = (line: string): number => {
	const [, value] = line.split(':')
	return Number(value.replaceAll(',', '').trim())
}

const parseLootType = (line: string): string => {
	const [, value] = line.split(':')
	return value.trim()
}

const generateSessionHash = async (text: string) => {
	const textBytes = new TextEncoder().encode(text)
	return toHashString(await crypto.subtle.digest('SHA-256', textBytes), 'hex')
		.substring(0, 24)
}

const parsePlayer = (
	[name, loot, supplies, balance, damage, healing]: string[],
) => ({
	name: name.replace('(Leader)', '').trim(),
	loot: parseNumberLine(loot),
	supplies: parseNumberLine(supplies),
	balance: parseNumberLine(balance),
	damage: parseNumberLine(damage),
	healing: parseNumberLine(healing),
})

export const parseHuntSession = async (text: string) => {
	const [sessionHeader, duration, lootType, loot, supplies, balance, ...lines] = text
		.trim()
		.split('\n')

	if (!lootType || !lootType.trim().startsWith('Loot Type:')) {
		throw new Error('Invalid input')
	}

	return {
		sessionId: await generateSessionHash(text),
		dates: {
			startDate: new Date(
				sessionHeader.split('From ')[1].split('to')[0].split(',').join('T')
					.replace(' ', '').trim(),
			),
			endDate: new Date(
				sessionHeader.split('to ')[1].split(',').join('T').replace(' ', '')
					.trim(),
			),
			durationMinutes: parseDuration(duration),
		},
		lootType: parseLootType(lootType),
		loot: parseNumberLine(loot),
		supplies: parseNumberLine(supplies),
		balance: parseNumberLine(balance),
		players: chunk(lines, 6).map(parsePlayer),
	}
}
