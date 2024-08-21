import httpx

from models.requests.SubscribeRequest import SubscribeRequest


class BackendService:
    def __init__(self, address: str):
        self.address = address

    async def notification_subscribe(self, request: SubscribeRequest):
        async with httpx.AsyncClient() as client:
            await client.post(
                self.address + "/api/notification/subscribe",
                json=request
            )

    async def notification_unsubscribe(self, request):
        async with httpx.AsyncClient() as client:
            await client.post(
                self.address + "/api/notification/unsubscribe",
                json=request
            )
