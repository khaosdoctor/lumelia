import 'https://deno.land/std@0.192.0/dotenv/load.ts'
import { z } from './deps.ts'

export const ConfigSchema = z.object({
	TELEGRAM_BOT_TOKEN: z.string(),
	TELEGRAM_BOT_API_SECRET_TOKEN: z.string(),
	DATABASE_CONNSTRING: z.string(),
	PORT: z.number().default(3000),
	BOT_WEBHOOK_URL: z.string().url(),
	DEV_MODE: z.string().optional().default('1').transform((v) =>
		Boolean(Number(v))
	),
})
export type Config = z.infer<typeof ConfigSchema>

export const config = ConfigSchema.parse(Deno.env.toObject())
