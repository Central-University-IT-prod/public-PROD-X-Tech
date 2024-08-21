import axios from "axios";
import { useEffect, useState } from "react";
import domain from "../../domain";
import Styles from "../TeamCard/User.module.css";
import BackendIcon from "/backend.svg";
import FrontendIcon from "/frontend.svg";
import MobileIcon from "/mobile.svg";
export default function MyTeam(props) {
    const [team, setTeam] = useState({});
    const [timates, setTimates] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isError, setIsError] = useState({ status: false, mess: "" });
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    };
    useEffect(() => {
        setLoading(true);
        axios
            .get(`${domain}/myteam`, config)
            .then(res => {
                setTeam(res.data);
                console.log(res.data);
                const members = [];
                props.isTeam(false, res.data.isLeader);
                res.data.members.forEach(member => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", `${domain}/watchuser/${member}`, false);
                    xhr.setRequestHeader(
                        "Authorization",
                        `Bearer ${localStorage.getItem("JWTToken")}`,
                    );
                    xhr.send();
                    members.push(JSON.parse(xhr.responseText));
                    setTimates(members);
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsError({ status: true, mess: err.response.data.text });
            });
    }, []);

    return (
        <>
            {!isError.status ? (
                <ul>
                    {timates.map((user, index) => (
                        <div
                            key={index}
                            className={`${Styles["user-container"]} ${index === 0 ? Styles["leader"] : ""}`}
                        >
                            <div className={Styles["user-up"]}>
                                {user.specialization && (
                                    <p className={Styles["spec"]}>
                                        {user?.specialization}
                                    </p>
                                )}
                                <p className={Styles["username"]}>{user.fio}</p>
                                {user.specialization && (
                                    <img
                                        className={Styles["icon"]}
                                        src={
                                            user.specialization.toLowerCase() ==
                                            "frontend"
                                                ? FrontendIcon
                                                : user.specialization.toLowerCase() ==
                                                    "mobile"
                                                  ? MobileIcon
                                                  : user.specialization.toLowerCase() ==
                                                      "backend"
                                                    ? BackendIcon
                                                    : ""
                                        }
                                    />
                                )}
                            </div>

                            <div className={Styles["user-stack"]}>
                                {user.skills && <p>Стэк:</p>}
                                {user.skills &&
                                    user.skills.map(skill => (
                                        <p
                                            className={Styles["info-text"]}
                                            key={skill.id}
                                            id={skill.id}
                                        >
                                            {skill.skill}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    ))}
                </ul>
            ) : (
                <p className={Styles["error-message"]}>{isError.mess}</p>
            )}
        </>
    );
}
