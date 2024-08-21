from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, scoped_session
from sqlalchemy import create_engine, MetaData
import os


class Model(DeclarativeBase):
   pass

class Users(Model):
   __tablename__ = "users"
   id: Mapped[int] = mapped_column(primary_key=True)
   fio: Mapped[str]
   username: Mapped[str] = mapped_column(unique=True)
   password: Mapped[str]
   isAdmin: Mapped[bool] = mapped_column(default=0)

class User_data(Model):
   __tablename__ = "user_data"
   id: Mapped[int] = mapped_column(primary_key=True)
   userid: Mapped[int]
   tg: Mapped[str] = mapped_column(nullable=True)
   specialization: Mapped[str] = mapped_column(nullable=True)

class User_skills(Model):
   __tablename__ = "user_skills"
   id: Mapped[int] = mapped_column(primary_key=True)
   userid: Mapped[int]
   skill: Mapped[str]

class achievemants(Model):
   __tablename__ = "achievemants"
   id: Mapped[int] = mapped_column(primary_key=True)
   userid: Mapped[int]
   achieve: Mapped[str]

class commands(Model):
   __tablename__ = "teams"
   id: Mapped[int] = mapped_column(primary_key=True)
   name: Mapped[str] = mapped_column(unique=True)
   leader: Mapped[int]

class members(Model):
   __tablename__ = "members"
   id: Mapped[int] = mapped_column(primary_key=True)
   command: Mapped[int]
   member: Mapped[int]

class invations(Model):
   __tablename__ = "invations"
   id: Mapped[int] = mapped_column(primary_key=True)
   command: Mapped[int]
   user: Mapped[int]
   to: Mapped[str]


class acess(Model):
   __tablename__ = "acess"
   id: Mapped[int] = mapped_column(primary_key=True)
   userid: Mapped[int]

def getsession():
    # postgresql://secret@dpg-co16naol5elc738q1o5g-a.frankfurt-postgres.render.com/new_db_y27r
    # sqlite:///database.db

   db_user = os.getenv('DB_USER', 'postgres')
   db_port = os.getenv('DB_PORT', 5432)
   db_host = os.getenv('DB_HOST', 'prod-x.tech:5432')
   db_password = os.getenv('DB_PASSWORD', 123)
   db_name = os.getenv('DB_NAME', 'postgres')

   engine = create_engine(f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}', pool_size=50, max_overflow=50)
   metadata = MetaData()
   metadata.bind = engine
   Model.metadata.create_all(engine)
   Session = sessionmaker(bind=engine)

   return scoped_session(Session)