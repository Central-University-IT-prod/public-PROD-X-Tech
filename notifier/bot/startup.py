import os

from aiogram import Dispatcher, Bot
from aiogram.methods import DeleteWebhook

from bot.routers import common, notification_subscribe

from services.BackendService import BackendService

bot_token = os.getenv('BOT_TOKEN', 'secret')
bot = Bot(token=bot_token)


async def run_bot():
    backend_host = os.getenv('API_HOST', 'http://localhost:8080')
    dp = Dispatcher(backend_service=BackendService(backend_host))

    dp.include_routers(
        common.router,
        notification_subscribe.router)

    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)
