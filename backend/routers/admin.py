from fastapi import Request, APIRouter, Header, UploadFile
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy import select, update, delete
from starlette.responses import JSONResponse
from database import getsession, Users, User_data, achievemants, User_skills, acess, commands, members, invations
from datetime import datetime, timedelta
import bcrypt
import jwt
import re
from .auth import checkauth
from spam import NotificationService
import random
import string

adminrouter = APIRouter()
session = getsession()
spam = NotificationService()

class addinteam(BaseModel):
    userid: int
    teamid: int

@adminrouter.post('/admin/setadmin/{userid}')
def setadmin(userid: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        isadmin = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin
        if not isadmin:
            return JSONResponse(status_code=403, content={"text": 'Это доступно только админам!'})
        session.execute(update(Users).where(Users.id == userid).values(
            isAdmin=True))
        session.commit()
        return JSONResponse(status_code=200, content={"text": 'Updated!'})

@adminrouter.post('/admin/demoteadmin/{userid}')
def demoteadmin(userid: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        isadmin = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin
        if not isadmin:
            return JSONResponse(status_code=403, content={"text": 'Это доступно только админам!'})
        session.execute(update(Users).where(Users.id == userid).values(
            isAdmin=False))
        session.commit()
        return JSONResponse(status_code=200, content={"text": 'Updated!'})

@adminrouter.get('/admin/allusers')
def allusers(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        isadmin = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin
        if not isadmin:
            return JSONResponse(status_code=403, content={"text": 'Это доступно только админам!'})

        user_list = []
        usrs = session.scalars(select(Users)).fetchall()
        for usr in usrs:
            aboutme = session.execute(select(User_data).where(User_data.userid == usr.id)).fetchone()[0]
            achieves = session.scalars(select(achievemants).where(achievemants.userid == usr.id)).fetchall()
            skills = session.scalars(select(User_skills).where(User_skills.userid == usr.id)).fetchall()
            me = {'id':usr.id, 'username': usr.username, 'fio': usr.fio, 'isAdmin': usr.isAdmin}
            if aboutme.tg:
                me['tg'] = aboutme.tg
            if aboutme.specialization:
                me['specialization'] = aboutme.specialization
            achieves = [{'id': i.id, 'text': i.achieve} for i in achieves]
            skills = [{'id': i.id, 'skill': i.skill} for i in skills]
            if achieves:
                me['achieves'] = achieves
            if skills:
                me['skills'] = skills
            teamown = session.execute(select(commands).where(commands.leader == usr.id)).fetchone()
            teamin = session.execute(select(members).where(members.member == usr.id)).fetchone()
            if teamown:
                teamid = teamown[0].id
            elif teamin:
                teamid = teamin[0].command
            else:
                teamid = False

            if teamid:
                me['team'] = teamid
            user_list.append(me)
        return JSONResponse(status_code=200, content=user_list)

@adminrouter.get('/admin/allteams')
def allteams(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        isadmin = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin
        if not isadmin:
            return JSONResponse(status_code=403, content={"text": 'Это доступно только админам!'})

        teams_list = []
        teams = session.scalars(select(commands)).fetchall()
        for team in teams:
            mem = session.scalars(select(members).where(members.command == team.id)).fetchall()
            if mem:
                team = {
                    "id": team.id,
                    "name": team.name,
                    "members": [team.leader] + [x.member for x in mem]
                }
            else:
                team = {
                    "id": team.id,
                    "name": team.name,
                    "members": [team.leader]}
            teams_list.append(team)
        return JSONResponse(status_code=200, content=teams_list)

@adminrouter.post("/admin/uploadparty/")
def uploadparty(file: UploadFile, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        isadmin = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin
        if not isadmin:
            return JSONResponse(status_code=403, content={"text": 'Это доступно только админам!'})
        try:
            data = file.file.read().decode('utf8').replace('\r','').split('\n')[1:]
            notify_list = []
            session.execute(delete(acess))
            session.commit()
            for i in data:
                about = i.split(',')
                if session.execute(select(Users).where(Users.fio == about[0])).fetchone() and session.execute(select(User_data).where(User_data.tg == about[1])).fetchone():
                    acce = acess(userid=session.execute(select(Users).where(Users.fio == about[0])).fetchone()[0].id)
                    session.add(acce)
                    session.commit()
                    notify_list.append(about[2])
                else:
                    username = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
                    password = ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=12)).replace(' ','*')
                    newreg = Users(fio=about[0], username=username, password=bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf8'))
                    session.add(newreg)
                    session.commit()
                    tg = User_data(userid=newreg.id, tg=about[1])
                    acce = acess(userid=newreg.id)
                    session.add(tg)
                    session.add(acce)
                    session.commit()
                    try:
                        spam.notify(email=about[2], message=f'Поздравляем! Ты прошел в заключительный этап олимпиады PROD,'
                                                    f' но мы заметили, что ты еще не зарегистрировался на нашем сервисе, поэтому'
                                                    f'мы зарегистрировали тебя сами!<br>Твои данные для входа:<br>'
                                                    f'Логин: {username}<br>Пароль: {password}')
                    except Exception as e:
                        print(e)
        except:
            return JSONResponse(status_code=409, content={"text": 'Неправильный csv файл:(('})
        if notify_list:
            try:
                spam.notify_all(emails=notify_list, message='Поздравляем! Ты прошел в заключительный этап <b>олимпиады PROD</b>!')
            except Exception as e:
                print(e)
        return JSONResponse(status_code=200, content={"text": 'Все пользователи добавлены!!'})

@adminrouter.get("/admin/statistics/team")
def getteamstat():
    all = len(session.scalars(select(acess)).fetchall())
    inteam = len(session.scalars(select(commands)).fetchall()) + len(session.scalars(select(members)).fetchall())
    return JSONResponse(status_code=200, content={
    "withTeam": inteam,
    "withoutTeam": all-inteam})

@adminrouter.get("/admin/statistics/specializations")
def getspecstat():
    return JSONResponse(status_code=200, content={
    "backendersCount": len(session.scalars(select(User_data).where(User_data.specialization == 'Backend')).fetchall()),
    "frontendersCount": len(session.scalars(select(User_data).where(User_data.specialization == 'Frontend')).fetchall()),
    "mobilersCount": len(session.scalars(select(User_data).where(User_data.specialization == 'Mobile')).fetchall())})

@adminrouter.post('/admin/adduserinteam')
def distribute(data: addinteam, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        isadmin = session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin
        if not isadmin:
            return JSONResponse(status_code=403, content={"text": 'Это доступно только админам!'})
        if (1 + len(session.scalars(select(members).where(members.command == data.teamid)).fetchall())) < 5:
            new_data = members(command=data.teamid, member=data.userid)
            session.add(new_data)
            session.commit()
        else:
            return JSONResponse(status_code=400, content={"text": 'Команда уже заполнена:(('})
        return JSONResponse(status_code=200, content={"text": 'Пользователь добавлен в команду!'})