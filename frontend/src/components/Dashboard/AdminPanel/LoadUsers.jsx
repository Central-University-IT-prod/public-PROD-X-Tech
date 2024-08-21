import axios from "axios";
import { useEffect, useState } from "react";
import domain from "../../../domain.js";
import Loader from "../../Loader/MainLoader.jsx";
import Styles from "./LoadUsers.module.css";

export default function LoadUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isAddTeam, setIsAddTeam] = useState(false);
    const [userId, setUserId] = useState("");
    const [isLoader, setIsLoader] = useState(false);
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    };

    function SetAdmin(id) {
        const formData = {};
        formData.userid = id;
        const newAllUsers = allUsers.map(user => ({
            fio: user.fio,
            id: user.id,
            isAdmin: user.isAdmin,
            tg: user.tg,
        }));
        newAllUsers[id - 1].isAdmin = true;
        setAllUsers(newAllUsers);
        axios
            .post(`${domain}/admin/setadmin/${id}`, formData, config)
            .then(() => ReturnUsers());
    }

    function DemoteAdmin(id) {
        const formData = {};
        formData.userid = id;
        const newAllUsers = allUsers.map(user => ({
            fio: user.fio,
            id: user.id,
            isAdmin: user.isAdmin,
            tg: user.tg,
        }));
        newAllUsers[id - 1].isAdmin = false;
        setAllUsers(newAllUsers);
        axios.post(`${domain}/admin/demoteadmin/${id}`, formData, config);
    }

    function AddUserToTeam(userId) {
        setUserId(userId);
        axios.get(`${domain}/admin/allteams`, config).then(res => {
            setTeams(res.data);
        });
        setIsAddTeam(!isAddTeam);
    }

    function onSubmitAddUserToTeam(e) {
        e.preventDefault();
        const formData = {};
        formData.userid = userId;
        formData.teamid = document.querySelector(
            'input[type="radio"]:checked',
        ).id;
        let listUsers = allUsers;
        listUsers[userId - 1].team = "test";
        setAllUsers(listUsers);
        document.getElementById(`add_to_team${userId}`).style.display = "none";
        axios
            .post(`${domain}/admin/adduserinteam`, formData, config)
            .then(() => {
                setIsAddTeam(false);
            });
    }

    function ShowAddUserToTeam() {
        return (
            <form
                className={Styles["team-container"]}
                onSubmit={onSubmitAddUserToTeam}
            >
                <p className={Styles["teams-title"]}>Команды</p>
                <ul>
                    {teams.map(team => (
                        <li key={team.id}>
                            <label htmlFor={team.id}>
                                <div style={{ display: "flex" }}>
                                    <p>{`${team.name} ${team.members.length}/5 `}</p>
                                </div>
                            </label>
                            <input
                                className={Styles["team-input"]}
                                type={"radio"}
                                id={team.id}
                                name={"name"}
                            />
                        </li>
                    ))}
                </ul>
                <input
                    className={Styles["team-submit"]}
                    type={"submit"}
                    value={"Добавить"}
                />
            </form>
        );
    }

    useEffect(() => {
        setIsLoader(true);
        axios
            .get(`${domain}/admin/allusers`, config)
            .then(res => {
                setAllUsers(res.data);
            })
            .finally(() => setIsLoader(false));
    }, []);

    function ReturnUsers() {
        return (
            <div style={{ display: "flex" }}>
                <ul>
                    {allUsers.map(user => (
                        <li key={user.id}>
                            <div className={Styles["user-container"]}>
                                <p className={Styles["username"]}>{user.fio}</p>
                                {user.isAdmin ? (
                                    <button
                                        style={{
                                            backgroundColor: "var(--magenta)",
                                        }}
                                        onClick={() => DemoteAdmin(user.id)}
                                    >
                                        {" "}
                                        Лишить прав админа{" "}
                                    </button>
                                ) : (
                                    <div style={{ display: "flex" }}>
                                        <button
                                            style={{
                                                backgroundColor: "var(--green)",
                                            }}
                                            onClick={() => SetAdmin(user.id)}
                                        >
                                            Назначить админом
                                        </button>
                                        {!user.team && (
                                            <button
                                                onClick={() =>
                                                    AddUserToTeam(user.id)
                                                }
                                                id={`add_to_team${user.id}`}
                                            >
                                                Добавить в команду
                                            </button>
                                        )}
                                    </div>
                                )}
                                {userId === user.id && isAddTeam && (
                                    <ShowAddUserToTeam />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return <div>{isLoader ? <Loader /> : <ReturnUsers />}</div>;
}
