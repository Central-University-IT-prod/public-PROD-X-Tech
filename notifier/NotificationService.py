import os

import httpx

from models.requests.NotifyAllRequest import NotifyAllRequest
from models.requests.NotifyRequest import NotifyRequest


class NotificationService:
    def __init__(self):
        host = os.getenv('NOTIFIER_HOST', 'localhost')
        port = os.getenv('NOTIFIER_PORT', 8081)

        self.unregistered_message = 'Поздравляем! Ты прошел в заключительный этап олимпиады PROD, но мы заметили, что ты еще не зарегистрировался в . ' \
        self.address = os.getenv(f'http://{host}:{port}', 'http://localhost:8081')

    def notify_unregistered(self, emails: list[str]):
        with httpx.Client() as client:
            client.post(f'{self.address}/api/notify/all', json=NotifyAllRequest(emails=emails, message='Поддержка X-Tech'))

    def notify_all(self, request: NotifyAllRequest):
        with httpx.Client() as client:
            client.post(f'{self.address}/api/notify/all',
                        json=NotifyAllRequest(emails=request.emails, message=request.message))

    def notify(self, request: NotifyRequest):
        with httpx.Client() as client:
            client.post(f'{self.address}/api/notify', json=NotifyRequest(email=request.email, message=request.message))
