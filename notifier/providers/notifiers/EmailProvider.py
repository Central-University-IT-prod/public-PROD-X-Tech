import os

import yagmail
from models.requests.NotifyAllRequest import NotifyAllRequest
from models.requests.NotifyRequest import NotifyRequest


class EmailProvider:
    def __init__(self):
        self.yag = yagmail.SMTP(
            user=os.getenv('SMTP_EMAIL', 'support@prod-x.tech'),
            port=os.getenv('SMTP_PORT', 25),
            # smtp_starttls=os.getenv('SMTP_HOST', 'us2.smtp.mailhostbox.com'),
            smtp_ssl=False,
            password=os.getenv('SMTP_PASSWORD', 'J#YmSxw4'),
            host=os.getenv('SMTP_HOST', 'smtp.prod-x.tech')
        )

    def notify(self, request: NotifyRequest):
        self.yag.send(
            to=request.email,
            subject='Поддержка X-Tech',
            contents=request.message,
            prettify_html=True
        )

    def notify_all(self, request: NotifyAllRequest):
        self.yag.send(
            to=request.emails,
            subject='Поддержка X-Tech',
            contents=request.message,
            prettify_html=True
        )
