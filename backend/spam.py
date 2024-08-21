import os

import httpx


class NotificationService:
    def __init__(self):
        host = os.getenv('NOTIFIER_HOST', 'localhost')
        port = os.getenv('NOTIFIER_PORT', 8081)

        self.address = f'http://{host}:{port}/api'

    def notify(self, email: str, message: str):
        with httpx.Client() as client:
            client.post(f'{self.address}/notify', json={
                'email': email,
                'message': message
            })

    def notify_all(self, emails: list[str], message: str):
        with httpx.Client() as client:
            client.post(f'{self.address}/notify/all', json={
                'emails': emails,
                'message': message
            })
