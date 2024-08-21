import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import notificationIcon from "../../../public/notification.svg";
import { LOGOUT } from "../../actions/types.jsx";
import domain from "../../domain.js";
import MainLoader from "../Loader/MainLoader";
import AdminPanel from "./AdminPanel.jsx";
import Styles from "./Dashboard.module.css";
import MyTeam from "./MyTeam.jsx";

export default function DashboardUser() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [specialization, setSpecialization] = useState("");
    const [flagFormTg, setFlagFormTg] = useState(false);
    const [flagFormPassword, setFlagFormPassword] = useState(false);
    const [error, setError] = useState("");
    const [fio, setFio] = useState("");
    const [isAdmin, setIsAdmin] = useState(null);
    const [tg, setTg] = useState("");
    const [userName, setUserName] = useState("");
    const [isNotification, setIsNotification] = useState(false);
    const [gotInvites, setGotInvites] = useState([]);
    const [sendInvites, setSendInvites] = useState([]);
    const [typeNotification, setTypeNotification] = useState("");
    const [achieves, setAchieves] = useState([]);
    const [skills, setSkills] = useState([]);
    const [err, setErr] = useState("");
    const [isCreate, setIsCreate] = useState(true);
    const [isLeader, setIsLeader] = useState(false);

    const updateIsSetCreate = (state, leader) => {
        setIsCreate(state);
        setIsLeader(leader);
    };

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    };

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(`${domain}/me`, config)
            .then(res => {
                setFio(res.data.fio);
                setIsAdmin(res.data.isAdmin);
                setTg(res.data.tg);
                setUserName(res.data.username);
                setAchieves(res.data.achieves || []);
                setSpecialization(res.data.specialization);
                setSkills(res.data.skills || []);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function FormSpecialization() {
        return (
            <div style={{ margin: "32px 0px" }}>
                <div
                    className={Styles["specialization-btns-container"]}
                    id={"specialization"}
                >
                    <button
                        type={"button"}
                        onClick={DataSpec}
                        id={"Frontend"}
                        className={
                            specialization === "Frontend" ? "active" : ""
                        }
                    >
                        Frontend
                    </button>
                    <button
                        type={"button"}
                        onClick={DataSpec}
                        id={"Backend"}
                        className={specialization === "Backend" ? "active" : ""}
                    >
                        Backend
                    </button>
                    <button
                        type={"button"}
                        onClick={DataSpec}
                        id={"Mobile"}
                        className={specialization === "Mobile" ? "active" : ""}
                    >
                        Mobile
                    </button>
                </div>
            </div>
        );
    }

    function DataSpec(e) {
        const formData = {};
        formData.specialization = e.target.id;
        setSpecialization(e.target.id);
        axios.patch(`${domain}/editabout`, formData, config);
    }

    // achieves
    function DeleteAchieve(id) {
        setAchieves(achieves.filter(achieve => id !== achieve.id));
        const formData = {};
        formData.id = id;
        axios.delete(`${domain}/deleteachieve`, {
            data: { id: id },
            headers: config.headers,
        });
    }

    function LoadAchives() {
        return (
            <div className={Styles["info-container"]}>
                {achieves.map(achieve => (
                    <p
                        className={Styles["info-text"]}
                        key={achieve.id}
                        id={achieve.id}
                    >
                        {achieve.text}
                        <button
                            className={Styles["achieve-btn"]}
                            onClick={() => DeleteAchieve(achieve.id)}
                            type={"button"}
                        >
                            {" "}
                            X
                        </button>
                    </p>
                ))}
            </div>
        );
    }

    function ChangeAbout(e, ach) {
        e.preventDefault();
        const formData = {};
        if (document.getElementById("achieveInput").value.trim() !== "") {
            setAchieves(() => [...achieves, ach]);
            formData.text = ach.text;
            axios.post(`${domain}/addachieve`, formData, config).then(() => {});
        } else {
            document.getElementById("achieveInput").value = "";
        }
    }

    function handleInputAchieveChange(e) {
        if (achieves.length > 0) {
            ChangeAbout(e, {
                id: achieves[achieves.length - 1].id + 1,
                text: document.getElementById("achieveInput").value,
            });
        } else {
            ChangeAbout(e, {
                id: 1,
                text: document.getElementById("achieveInput").value,
            });
        }
    }

    function FormAchieves() {
        return (
            <div style={{ margin: "32px 0px" }}>
                <p className={Styles["input-label"]}>Достижения</p>
                <LoadAchives />
                <form onSubmit={e => handleInputAchieveChange(e)}>
                    <input
                        style={{ marginTop: "24px" }}
                        type={"text"}
                        id={"achieveInput"}
                        placeholder={"Впишите достижение/олимпиаду"}
                    />
                    <button type={"submit"}>Добавить</button>
                </form>
            </div>
        );
    }

    // skills
    function ChangeSkills(e, achieve) {
        e.preventDefault();
        if (document.getElementById("skillInput").value.trim() !== "") {
            setSkills(() => [...skills, achieve]);
            const formData = {};
            formData.text = achieve.skill;
            axios.post(`${domain}/addskill`, formData, config);
        } else {
            document.getElementById("skillInput").value = "";
        }
    }

    function handleInputSkillsChange(e) {
        if (skills.length > 0) {
            ChangeSkills(e, {
                id: skills[skills.length - 1].id + 1,
                skill: document.getElementById("skillInput").value,
            });
        } else {
            ChangeSkills(e, {
                id: 1,
                skill: document.getElementById("skillInput").value,
            });
        }
    }

    function DeleteSkill(id) {
        setSkills(skills.filter(skill => id !== skill.id));
        axios.delete(`${domain}/deleteskill`, {
            data: { id: id },
            headers: config.headers,
        });
    }

    function LoadSkills() {
        return (
            <div className={Styles["info-container"]}>
                {skills.map(skill => (
                    <p
                        className={Styles["info-text"]}
                        key={skill.id}
                        id={skill.id}
                    >
                        {skill.skill}
                        <button
                            className={Styles["achieve-btn"]}
                            onClick={() => DeleteSkill(skill.id)}
                            type={"button"}
                        >
                            X
                        </button>
                    </p>
                ))}
            </div>
        );
    }

    function FormSkill() {
        return (
            <div style={{ margin: "32px 0px" }}>
                <p className={Styles["input-label"]}>Скиллы/Стэк</p>
                <LoadSkills />
                <form onSubmit={e => handleInputSkillsChange(e)}>
                    <input
                        style={{ marginTop: "24px" }}
                        type={"text"}
                        id={"skillInput"}
                        placeholder={"Впишите скилл"}
                    />
                    <button type={"submit"}>Добавить</button>
                </form>
            </div>
        );
    }

    // Notification
    function DeleteNotfication(id) {
        setGotInvites(gotInvites.filter(invite => invite.id !== id));
    }

    function RejectInvite(invite) {
        const formData = {};
        formData.invite_id = invite.id;
        DeleteNotfication(invite.id);
        axios.post(`${domain}/rejectinvite/${invite.id}`, formData, config);
    }

    function AcceptInvite(invite) {
        const formData = {};
        formData.invite_id = invite.id;
        DeleteNotfication(invite.id);
        axios
            .post(`${domain}/acceptinvite/${invite.id}`, formData, config)
            .then(() => setErr(""))
            .catch(err => {
                console.log(err.response.data.text);
                setErr(err.response.data.text);
            });
    }

    function DataNotification() {
        setIsNotification(true);
        document.addEventListener("click", event => {
            if (
                !event.target.closest("#notification-container") &&
                !event.target.closest("#notificationButton")
            ) {
                setIsNotification(false);
            }
        });
        axios
            .get(`${domain}/myinvites`, config)
            .then(res => {
                setGotInvites(res.data.getted_invites);
                setSendInvites(res.data.sended_invites);
                setTypeNotification(res.data.type);
                console.log(res.data.getted_invites);
            })
            .catch(err => {
                console.log(err.response.data.text);
            });
    }

    function LoadSended() {
        return (
            <ul>
                {err === "" ? (
                    <>
                        {gotInvites.map(gotInvite => (
                            <li key={gotInvite.id} style={{ display: "flex" }}>
                                {gotInvite.name} отправил запрос на вступление
                                <button
                                    style={{
                                        backgroundColor: "var(--magenta)",
                                    }}
                                    onClick={() => RejectInvite(gotInvite)}
                                >
                                    x
                                </button>
                                <button
                                    style={{ backgroundColor: "var(--green)" }}
                                    onClick={() => AcceptInvite(gotInvite)}
                                >
                                    ✓
                                </button>
                            </li>
                        ))}
                        {sendInvites.map(sendInvite => (
                            <li key={sendInvite.name}>
                                {" "}
                                Вы пригласили {sendInvite.name}
                            </li>
                        ))}
                    </>
                ) : (
                    { err }
                )}
            </ul>
        );
    }

    function LoadGetted() {
        return (
            <>
                <ul>
                    {gotInvites.map(gotInvite => (
                        <li
                            className={Styles["notification-message"]}
                            key={gotInvite.id}
                            style={{ display: "flex" }}
                        >
                            Вас пригласили в команду {gotInvite.name}
                            <button
                                style={{
                                    backgroundColor: "var(--magenta)",
                                    marginRight: "4px",
                                }}
                                onClick={() => RejectInvite(gotInvite)}
                            >
                                x
                            </button>
                            <button
                                style={{ backgroundColor: "var(--green)" }}
                                onClick={() => AcceptInvite(gotInvite)}
                            >
                                ✓
                            </button>
                        </li>
                    ))}
                </ul>
                <ul>
                    {sendInvites.map(sendInvite => (
                        <li key={sendInvite.id} style={{ display: "flex" }}>
                            Вы отправили заявку на вступление в{" "}
                            {sendInvite.name}
                        </li>
                    ))}
                </ul>
            </>
        );
    }

    function LoadNotification() {
        return (
            <section className={Styles["notification-overlay"]}>
                <div
                    className={Styles["notification-container"]}
                    id={"notification-container"}
                >
                    <h1 style={{ marginBottom: "8px" }}> Заявки команды </h1>
                    {typeNotification === "peoples" ? (
                        sendInvites.length + gotInvites.length > 0 ? (
                            <LoadSended />
                        ) : (
                            <p>Вы не отправили ни одну заявку на вступление</p>
                        )
                    ) : gotInvites.length + sendInvites.length > 0 ? (
                        <LoadGetted />
                    ) : (
                        <p>Вас не пригласили ни в одну команду</p>
                    )}
                </div>
            </section>
        );
    }

    function AddCommand() {
        const [team, setTeam] = useState("");
        const createTeam = () => {
            axios
                .post(`${domain}/createteam`, { name: team }, config)
                .then(res => {
                    console.log(res);
                    setIsCreate(false);
                })
                .catch(err => console.error(err));
        };
        const deleteTeam = () => {
            axios
                .delete(`${domain}/deleteteam`, {
                    headers: config.headers,
                })
                .then(res => setIsCreate(true))
                .catch(err => console.error(err));
        };
        return (
            <>
                {isCreate && (
                    <>
                        <input
                            type="text"
                            onInput={e => setTeam(e.target.value)}
                            placeholder="Название команды"
                        />
                        <button onClick={createTeam}>Создать команду</button>
                    </>
                )}{" "}
                {isLeader && !isCreate && (
                    <button
                        onClick={deleteTeam}
                        style={{ backgroundColor: "var(--magenta)" }}
                    >
                        Удалить команду
                    </button>
                )}
            </>
        );
    }

    function DashboardUser() {
        return (
            <section className={Styles["dashboard-container"]}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <h1 className={Styles["page-title"]}> Личный кабинет </h1>
                    <button
                        id="notificationButton"
                        className={Styles["notification-button"]}
                        onClick={DataNotification}
                    >
                        <img
                            className={Styles["notification-image"]}
                            src={notificationIcon}
                        />
                    </button>
                </div>
                {isNotification && <LoadNotification />}
                <h2 className={Styles["specialization-title"]}>
                    Выберите специализацию:
                </h2>
                <FormSpecialization />
                <div className={"container"}>
                    <div className={Styles["input-container"]}>
                        <label htmlFor={"fio"}>
                            <p className={Styles["input-label"]}>ФИО</p>
                            <input
                                type={"text"}
                                id={"fio"}
                                value={fio}
                                disabled={true}
                            />
                        </label>
                    </div>

                    <div style={{ margin: "32px 0px" }}>
                        <label htmlFor={"tg"}>
                            <p className={Styles["input-label"]}>Телеграм</p>
                            <input
                                type={"text"}
                                id={"tg"}
                                value={tg}
                                disabled={true}
                            />
                            <button onClick={() => setFlagFormTg(!flagFormTg)}>
                                Изменить телеграмм
                            </button>
                            {flagFormTg && <LoadFormChangeUserTg />}
                        </label>
                    </div>

                    <div style={{ margin: "32px 0px" }}>
                        <label htmlFor={"login"}>
                            <p className={Styles["input-label"]}>Логин</p>
                            <input
                                type={"text"}
                                id={"login"}
                                value={userName}
                                disabled={true}
                            />
                        </label>
                    </div>
                    <FormAchieves />
                    <FormSkill />
                    <AddCommand />
                    <p className={Styles["input-label"]}>Моя команда</p>
                    <MyTeam isTeam={updateIsSetCreate}></MyTeam>
                    <div className={Styles["actions-btn-container"]}>
                        <button
                            onClick={() => {
                                setFlagFormPassword(!flagFormPassword);
                            }}
                        >
                            Сменить пароль
                        </button>

                        {flagFormPassword && <ChangePasswordForm />}

                        <button
                            style={{ backgroundColor: "var(--magenta)" }}
                            onClick={HandleLogout}
                        >
                            Выйти из аккаунта
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    function HandleLogout() {
        dispatch({ type: LOGOUT });
    }

    function LoadFormChangeUserTg() {
        return (
            <form
                className={Styles["telegram-container"]}
                onSubmit={ChangeUserTg}
            >
                <input
                    type={"text"}
                    id={"changeTg"}
                    placeholder="Новый юзернейм телеграм"
                />
                <button className={Styles["actions-btn"]} type={"submit"}>
                    Сохранить
                </button>
            </form>
        );
    }

    function ChangeUserTg(e) {
        e.preventDefault();
        const formData = {};
        formData.tg = document.getElementById("changeTg").value;
        setTg(formData.tg);
        setFlagFormTg(!flagFormTg);
        axios.patch(`${domain}/editabout`, formData, config);
    }

    function ChangePasswordForm() {
        return (
            <form onSubmit={ChangePassword}>
                <p
                    htmlFor={"oldPassword"}
                    className={Styles["input-action-label"]}
                >
                    Старый пароль
                </p>
                <input
                    className={Styles["action-input"]}
                    type={"password"}
                    id={"oldPassword"}
                />
                <p
                    htmlFor={"changePassword"}
                    className={Styles["input-action-label"]}
                >
                    Новый пароль
                </p>
                <input
                    className={Styles["action-input"]}
                    type={"password"}
                    id={"changePassword"}
                />
                {error !== "" && error}
                <button
                    type={"submit"}
                    style={{ backgroundColor: "var(--green)" }}
                >
                    Сохранить
                </button>
            </form>
        );
    }

    function ChangePassword(e) {
        e.preventDefault();
        const formData = {};
        formData.oldpass = document.getElementById("oldPassword").value;
        formData.newpass = document.getElementById("changePassword").value;
        axios
            .patch(`${domain}/passwordupdate`, formData, config)
            .then(() => {
                setFlagFormPassword(false);
            })
            .catch(err => {
                console.log(err);
                setError(err.response.data.text);
            });
    }

    return (
        <>
            {isLoading ? (
                <MainLoader />
            ) : isAdmin ? (
                <AdminPanel />
            ) : !isAdmin ? (
                <DashboardUser />
            ) : null}
        </>
    );
}
