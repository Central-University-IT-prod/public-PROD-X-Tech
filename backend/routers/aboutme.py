from fastapi import Request, APIRouter, Header
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy import select, update, delete
from starlette.responses import JSONResponse
from database import getsession, Users, User_data, achievemants, User_skills
from datetime import datetime, timedelta
import bcrypt
import jwt
import re
from .auth import checkauth

aboutrouter = APIRouter()
session = getsession()

class achieve(BaseModel):
    text: str
class achieveid(BaseModel):
    id: int
class editabout(BaseModel):
    tg: str | None = None
    specialization: str | None = None

@aboutrouter.patch('/editabout')
def editabout(about: editabout, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        new_data = User_data(userid=auth[1][0], tg=about.tg, specialization=about.specialization)
        existing_data = session.query(User_data).filter_by(userid=auth[1][0]).first()

        if existing_data:
            if about.tg:
                existing_data.tg = about.tg
            if about.specialization:
                existing_data.specialization = about.specialization
        else:
            session.add(new_data)
        session.commit()

        return JSONResponse(status_code=200, content={"text": 'data updated!!'})

@aboutrouter.post('/addachieve')
def addachive(achieve: achieve, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        new_data = achievemants(userid=auth[1][0], achieve=achieve.text)
        session.add(new_data)
        session.commit()
        return JSONResponse(status_code=201, content={"text": 'achieve added!!'})

@aboutrouter.delete('/deleteachieve')
def deleteachieve(id: achieveid, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        session.execute(delete(achievemants).where(achievemants.id == id.id))
        session.commit()
        return JSONResponse(status_code=200, content={"text": 'achieve deleted!!'})

@aboutrouter.post('/addskill')
def addskill(skill: achieve, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        new_skill = User_skills(userid=auth[1][0], skill=skill.text)
        session.add(new_skill)
        session.commit()
        return JSONResponse(status_code=201, content={"text": 'skill created!!'})

@aboutrouter.delete('/deleteskill')
def deleteskill(id: achieveid, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        session.execute(delete(User_skills).where(User_skills.id == id.id))
        session.commit()
        return JSONResponse(status_code=200, content={"text": 'skill deleted!!'})

@aboutrouter.get('/me')
def getprofile(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        me = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0]
        aboutme = session.execute(select(User_data).where(User_data.userid == auth[1][0])).fetchone()[0]
        achieves = session.scalars(select(achievemants).where(achievemants.userid == auth[1][0])).fetchall()
        skills = session.scalars(select(User_skills).where(User_skills.userid == auth[1][0])).fetchall()
        me = {'username':me.username, 'fio':me.fio, 'isAdmin':me.isAdmin}
        if aboutme.tg:
            me['tg'] = aboutme.tg
        if aboutme.specialization:
            me['specialization'] = aboutme.specialization
        achieves = [{'id':i.id, 'text':i.achieve} for i in achieves]
        skills = [{'id':i.id, 'skill':i.skill} for i in skills]
        if achieves:
            me['achieves'] = achieves
        if skills:
            me['skills'] = skills
        return me




