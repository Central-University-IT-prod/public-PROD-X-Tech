from fastapi import Request, APIRouter, Header
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy import select, update
from starlette.responses import JSONResponse
from database import getsession, Users
from datetime import datetime, timedelta
import bcrypt
import jwt
import re

authrouter = APIRouter()
session = getsession()
class Userreg(BaseModel):
    fio: str
    username: str
    password: str

class Usersignin(BaseModel):
    username: str
    password: str

class Passupd(BaseModel):
    oldpass: str
    newpass: str
@authrouter.post('/register')
def register(usr: Userreg):
    userfield = Users(fio=usr.fio, username=usr.username,
                      password=bcrypt.hashpw(usr.password.encode(), bcrypt.gensalt()).decode('utf8'))
    session.add(userfield)
    try:
        session.commit()
    except:
        session.rollback()
        return JSONResponse(status_code=409, content={'text':'неуникальное имя или юзернейм'})
    return JSONResponse(status_code=201, content={'text':'created sucesfully!'})

@authrouter.post('/login')
def login(usr: Usersignin):
    stmt = select(Users).where(Users.username == usr.username)
    user = session.execute(stmt).fetchone()
    if not user:
        return JSONResponse(status_code=404, content={'text': 'не нашел юзера с таким именем'})
    else:
        valid = bcrypt.checkpw(usr.password.encode(), user[0].password.encode('utf8'))
        if valid:
            dt = datetime.now() + timedelta(days=1)
            encoded = jwt.encode({"id": user[0].id,
                                  'isAdmin': user[0].isAdmin,
                                  'exp': dt.utcfromtimestamp(dt.timestamp())}, "secret", algorithm="HS256")
            return JSONResponse(status_code=200, content={"token": encoded})
        else:
            return JSONResponse(status_code=401, content={'text': 'неверный пароль'})

@authrouter.patch('/passwordupdate')
def updatepass(passes: Passupd, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        stmt = select(Users).where(Users.id == auth[1][0])
        user = session.execute(stmt).fetchone()[0]
        if bcrypt.checkpw(passes.oldpass.encode(), user.password.encode('utf8')):
            user = session.execute(update(Users).where(Users.id == auth[1][0]).values(password=bcrypt.hashpw(passes.newpass.encode(), bcrypt.gensalt()).decode('utf8')))
            session.commit()
            return JSONResponse(status_code=200, content={"text": 'password updated!!'})
        else:
            return JSONResponse(status_code=403, content={"text": 'старый пароль неверен'})


def checkauth(token):
    if not token:
        return [False, JSONResponse(status_code=401, content={'text': 'нет токена в запросе'})]
    else:
        try:
            data = jwt.decode(token, "secret", algorithms=["HS256"])
            return [True, (data['id'], data['isAdmin'])]
        except:
            return [False, JSONResponse(status_code=401, content={'text': 'неверный или просроченый токен'})]

