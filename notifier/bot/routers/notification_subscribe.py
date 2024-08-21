from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import Message, ReplyKeyboardRemove

from models.requests.SubscribeRequest import SubscribeRequest
from services.BackendService import BackendService

router = Router()


@router.message(Command("subscribe"))
async def subscribe_command(message: Message,
                            backend_service: BackendService):
    await backend_service.notification_subscribe(SubscribeRequest(
        telegramId=message.from_user.id,
        telegramHandle=message.from_user.username))

    await message.answer("🎉 Вы подписались на уведомления")


@router.message(Command("unsubscribe"))
async def unsubscribe_command(message: Message,
                              backend_service: BackendService):
    await backend_service.notification_subscribe(SubscribeRequest(
        telegramId=message.from_user.id,
        telegramHandle=message.from_user.username))

    await message.answer("🎉 Вы отписались от уведомлений")