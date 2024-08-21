from fastapi import Request, APIRouter, Header
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

teamrouter = APIRouter()
session = getsession()

def checkacess(userid):
    existing_data = session.execute(select(acess).where(acess.userid == userid)).fetchone()
    isAdmin = session.execute(select(Users).where(Users.id == userid)).fetchone()[0].isAdmin
    if existing_data or isAdmin:
        return True
    else:
        return False

class team(BaseModel):
    name: str

@teamrouter.post('/createteam')
def createteam(about: team, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        new_data = commands(name=about.name, leader=auth[1][0])
        existing_data = session.query(commands).filter_by(leader=auth[1][0]).first()
        if existing_data:
            return JSONResponse(status_code=409, content={"text": 'Невозможно создать две команды!'})
        else:
            session.add(new_data)
        try:
            session.commit()
        except:
            session.rollback()
            return JSONResponse(status_code=409, content={'text': 'неуникальное имя команды'})
        return JSONResponse(status_code=201, content={"text": 'team created!!'})


@teamrouter.delete('/deleteteam')
def deleteteam(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        comid = session.execute(select(commands).where(commands.leader == auth[1][0])).fetchone()
        if comid:
            session.execute(delete(commands).where(commands.leader == auth[1][0]))
            session.execute(delete(members).where(members.command == comid[0].id))
            session.execute(delete(invations).where(invations.command == comid[0].id))
            session.commit()
        return JSONResponse(status_code=200, content={"text": 'command deleted if you was leader'})

@teamrouter.post('/leaveteam')
def leaveteam(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})
        session.execute(delete(members).where(members.member == auth[1][0]))
        session.commit()
        return JSONResponse(status_code=200, content={"text": 'command leaved if it was'})

@teamrouter.get('/myteam')
def myteam(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        teamown = session.execute(select(commands).where(commands.leader == auth[1][0])).fetchone()
        teamin = session.execute(select(members).where(members.member == auth[1][0])).fetchone()

        if teamown:
            teamid = teamown[0].id
        elif teamin:
            teamid = teamin[0].command
        else:
            return JSONResponse(status_code=404, content={"text": 'у вас нет команды:('})

        team = session.execute(select(commands).where(commands.id == teamid)).fetchone()[0]
        mem = session.scalars(select(members).where(members.command == teamid)).fetchall()
        if mem:
            team = {
            "id": team.id,
            "name": team.name,
            "members": [team.leader] + [x.member for x in mem],
            "isLeader": team.leader == auth[1][0]
            }
        else:
            team = {
                "id": team.id,
                "name": team.name,
                "members": [team.leader],
                "isLeader": team.leader == auth[1][0]}

        return JSONResponse(status_code=200, content=team)

@teamrouter.get("/watchteam/{team_id}")
def watchteam(team_id: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        team = session.execute(select(commands).where(commands.id == team_id)).fetchone()
        mem = session.scalars(select(members).where(members.command == team_id)).fetchall()
        if not team:
            return JSONResponse(status_code=404, content={"text": 'команды с таким айди не существует!'})

        if mem:
            team = {
            "id":team[0].id,
            "name":team[0].name,
            "members":[team[0].leader] + [x.member for x in mem]
            }
        else:
            team = {
                "id": team[0].id,
                "name": team[0].name,
                "members": [team[0].leader]}

        return JSONResponse(status_code=200, content=team)

@teamrouter.get("/watchuser/{user_id}")
def watchuser(user_id: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        me = session.execute(select(Users).where(Users.id == user_id)).fetchone()
        if me:
            me = me[0]
        else:
            return JSONResponse(status_code=404, content={"text": 'юзер с таким айди не существует!'})
        aboutme = session.execute(select(User_data).where(User_data.userid == user_id)).fetchone()[0]
        achieves = session.scalars(select(achievemants).where(achievemants.userid == user_id)).fetchall()
        skills = session.scalars(select(User_skills).where(User_skills.userid == user_id)).fetchall()
        me = {'username': me.username, 'fio': me.fio, 'isAdmin': me.isAdmin}
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
        return me

@teamrouter.get("/feed")
def getfeed(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        if session.execute(select(Users).where(Users.id == auth[1][0])).fetchone()[0].isAdmin:
            return JSONResponse(status_code=403, content={"text": 'Админ не может просматривать ленту:('})

        if session.execute(select(commands).where(commands.leader == auth[1][0])).fetchone():
            type = 'users'
            users_ac = session.scalars(select(acess)).fetchall()
            userlist = []
            for usr in users_ac:
                id = usr.userid
                if not session.execute(select(commands).where(commands.leader == id)).fetchone() and not session.execute(select(members).where(members.member == id)).fetchone():
                    me = session.execute(select(Users).where(Users.id == id)).fetchone()[0]
                    aboutme = session.execute(select(User_data).where(User_data.userid == id)).fetchone()[0]
                    achieves = session.scalars(select(achievemants).where(achievemants.userid == id)).fetchall()
                    skills = session.scalars(select(User_skills).where(User_skills.userid == id)).fetchall()
                    me = {'id':me.id,'username': me.username, 'fio': me.fio, 'isAdmin': me.isAdmin}
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

                    userlist.append(me)
            return JSONResponse(status_code=200, content={'type':type,'list':userlist})

        else:
            type = 'teams'
            teams = session.scalars(select(commands)).fetchall()
            teamlist = []
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
                if len(team['members']) < 5 and not auth[1][0] in team['members']:
                    teamlist.append(team)
            return JSONResponse(status_code=200, content={'type':type,'list':teamlist})

@teamrouter.post("/inteampetition/{team_id}")
def petition(team_id: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        teamin = session.execute(select(members).where(members.member == auth[1][0])).fetchone()
        if teamin:
            return JSONResponse(status_code=400, content={"text": 'сначала необходимо покинуть текущую команду'})

        new_data = invations(user=auth[1][0], command=team_id, to='team')
        existing_data = session.query(invations).filter_by(user=auth[1][0], command=team_id, to='team').first()
        if existing_data:
            return JSONResponse(status_code=201, content={"text": 'заявка отправлена!'})
        else:
            session.add(new_data)
            session.commit()
            return JSONResponse(status_code=201, content={"text": 'заявка отправлена!'})

@teamrouter.post("/inteaminvite/{user_id}")
def invite(user_id: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        team_id = session.execute(select(commands).where(commands.leader == auth[1][0])).fetchone()[0].id
        new_data = invations(user=user_id, command=team_id, to='user')
        existing_data = session.query(invations).filter_by(user=user_id, command=team_id, to='user').first()
        if existing_data:
            return JSONResponse(status_code=201, content={"text": 'приглашение создано!'})
        else:
            session.add(new_data)
            session.commit()
            return JSONResponse(status_code=201, content={"text": 'приглашение создано!'})

@teamrouter.get("/myinvites")
def invites(Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        teamown = session.execute(select(commands).where(commands.leader == auth[1][0])).fetchone()
        sended_invites = []
        getted_invites = []
        if teamown:
            type = 'peoples'
            sended = session.scalars(select(invations).where(invations.command == teamown[0].id, invations.to == 'user')).fetchall()
            getted = session.scalars(select(invations).where(invations.command == teamown[0].id, invations.to == 'team')).fetchall()
            for appl in sended:
                sended_invites.append({"id":appl.id, "userid":appl.user, "name":session.execute(select(Users).where(Users.id == appl.user)).fetchone()[0].username})
            for appl in getted:
                getted_invites.append({"id":appl.id, "userid":appl.user, "name":session.execute(select(Users).where(Users.id == appl.user)).fetchone()[0].username})
        else:
            type = 'teams'
            sended = session.scalars(
                select(invations).where(invations.user == auth[1][0], invations.to == 'team')).fetchall()
            getted = session.scalars(
                select(invations).where(invations.user == auth[1][0], invations.to == 'user')).fetchall()
            for appl in sended:
                sended_invites.append({"id": appl.id, "team": appl.command, "name": session.execute(select(commands).where(commands.id == appl.command)).fetchone()[0].name})
            for appl in getted:
                getted_invites.append({"id": appl.id, "team": appl.command, "name": session.execute(select(commands).where(commands.id == appl.command)).fetchone()[0].name})

        return JSONResponse(status_code=200, content={"type":type, "sended_invites":sended_invites,
                                                      "getted_invites":getted_invites})

@teamrouter.post("/acceptinvite/{invite_id}")
def acceptinvite(invite_id: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        invite = session.execute(select(invations).where(invations.id == invite_id)).fetchone()
        if invite:
            invite = invite[0]
            if invite.to == 'user':
                if session.query(commands).filter_by(leader=auth[1][0]).first() or session.query(members).filter_by(member=auth[1][0]).first():
                    return JSONResponse(status_code=400, content={"text": 'Сначала покиньте предыдущую команду!!'})
                session.execute(delete(invations).where(invations.id == invite_id))
                session.commit()
                if (1 + len(session.scalars(select(members).where(members.command == invite.command)).fetchall()))<5:
                    new_data = members(command=invite.command, member=invite.user)
                    session.add(new_data)
                    session.commit()
                else:
                    return JSONResponse(status_code=400, content={"text": 'Команда уже заполнена:(('})
            else:
                session.execute(delete(invations).where(invations.id == invite_id))
                new_data = invations(command=invite.command, user=invite.user, to='user')
                session.add(new_data)
                session.commit()
            return JSONResponse(status_code=200, content={"text": 'invite accepted!'})
        else:
            return JSONResponse(status_code=404, content={"text": 'cant find invite with this id'})

@teamrouter.post("/rejectinvite/{invite_id}")
def rejectinvite(invite_id: int, Authorization: Annotated[str | None, Header()] = None):
    auth = checkauth(Authorization.split()[1])
    if not auth[0]:
        return auth[1]
    else:
        if not checkacess(auth[1][0]):
            return JSONResponse(status_code=403, content={"text": 'у вас нет доступа к заключительному этапу'})

        session.execute(delete(invations).where(invations.id == invite_id))
        session.commit()

        return JSONResponse(status_code=200, content={"text": 'invite rejected if it was'})


