from bot.startup import bot
from models.requests.NotifyAllRequest import NotifyAllRequest
from models.requests.NotifyRequest import NotifyRequest


class TelegramProvider:
    async def notify(self, request: NotifyRequest):
        await bot.send_message(chat_id=request.telegramId,
                               text=request.message,
                               parse_mode='HTML')

    async def notify_all(self, request: NotifyAllRequest):
        for telegramId in request.telegramIds:
            await bot.send_message(chat_id=telegramId,
                                   text=request.message,
                                   parse_mode='HTML')
