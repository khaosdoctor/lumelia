import { Application, Router, webhookCallback } from './deps.ts'
import { bot } from './bot.ts'
import { config } from './config.ts'

const app = new Application()
const router = new Router()

router.post('/set-webhook', async (ctx) => {
	const result = await bot.api.setWebhook(config.BOT_WEBHOOK_URL, {
		secret_token: config.TELEGRAM_BOT_API_SECRET_TOKEN,
	})
	ctx.response.body = result
	ctx.response.status = 201
})

app.use(webhookCallback(bot, 'oak', { secretToken: config.TELEGRAM_BOT_API_SECRET_TOKEN }))
app.use(router.routes())
app.listen({ port: config.PORT })
