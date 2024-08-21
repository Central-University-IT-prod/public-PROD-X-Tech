import asyncio
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from bot.startup import run_bot
from models.requests.NotifyAllRequest import NotifyAllRequest
from models.requests.NotifyRequest import NotifyRequest
from providers.notifiers.EmailProvider import EmailProvider

app = FastAPI()
app_port = int(os.getenv('NOTIFIER_PORT', 8081))

email_provider = EmailProvider()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/notify")
def notify(request: NotifyRequest):
    email_provider.notify(request)

    return JSONResponse(status_code=200, content={
        "success": True
    })


@app.post("/api/notify/all")
def notify_all(request: NotifyAllRequest):
    email_provider.notify_all(request)

    return JSONResponse(status_code=200, content={
        "success": True
    })


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=app_port)
