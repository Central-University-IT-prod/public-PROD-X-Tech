from fastapi import FastAPI
import uvicorn
from routers.auth import authrouter
from routers.aboutme import aboutrouter
from routers.teams import teamrouter
from routers.admin import adminrouter

#https://github.com/Central-University-IT-prod/team-x-tech
from fastapi.middleware.cors import CORSMiddleware

import os

app = FastAPI()

api_port = int(os.getenv('API_PORT', 8000))
api_host = os.getenv('API_HOST', 'localhost')

app.include_router(authrouter)
app.include_router(aboutrouter)
app.include_router(teamrouter)
app.include_router(adminrouter)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run(app, host=api_host, port=api_port)