import axios from "axios";
import { useEffect, useState } from "react";
import domain from "../../domain";
import Styles from "./User.module.css";
import BackendIcon from "/backend.svg";
import FrontendIcon from "/frontend.svg";
import MobileIcon from "/mobile.svg";

export const User = props => {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    };
    const getUser = () => {
        setIsLoading(true);
        axios
            .get(`${domain}/watchuser/${props.userId}`, config)
            .then(res => {
                setUser(res.data);
                console.log("user", res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    };
    useEffect(() => {
        getUser();
    }, []);
    return (
        <div
            className={`${Styles["user-container"]} ${props.userIndex === 0 ? Styles["leader"] : ""}`}
        >
            {isLoading ? (
                <>
                    <p className={Styles["spec"]}>frontend</p>
                    <div className={Styles["skeleton"]}></div>
                </>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
};
