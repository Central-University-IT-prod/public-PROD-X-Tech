from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

router = Router()


@router.message(Command("start"))
async def start_command(message: Message):
    print(message.from_user.id)
    await message.answer("🎉 Привет, это бот для сервиса X-Tech."
                         " Здесь ты можешь подписаться на различные уведомления в нашем сервисе")
