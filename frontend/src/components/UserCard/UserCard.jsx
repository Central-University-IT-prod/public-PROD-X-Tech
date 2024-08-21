import axios from "axios";
import domain from "../../domain";
import Styles from "./UserCard.module.css";
import { useState } from "react";
import LoaderImg from "/loader.gif";
import randomColor from '../../assets/js/randomColor'

export const UserCard = props => {
    const [color, setColor] = useState(randomColor()[0])
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestSended, setIsRequestSended] = useState(false);

    const handleRequestSend = ()=>{
        setIsRequestSended(true);
    }

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    }; 

    const inTeamInvite = id => {
        setIsLoading(true);
        axios
            .post(`${domain}/inteaminvite/${id}`, {}, config)
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className={Styles["container"]}>

            <img src={LoaderImg} style={{ display: "none" }} />
            <div className={Styles["description"]}>
                <p className={Styles["username"]}>{props.user.fio}</p>
                {props.user.specialization && (
                    <p id={Styles['spec']} className={Styles["username"]}>
                        {props.user.specialization}
                    </p>
                )}
                <p className={Styles["contacts"]}>{props.user.tg}</p>
                <button
                    onClick={(e) => {inTeamInvite(props.user.id); handleRequestSend()}}
                    className={Styles["invite-btn"]}
                    disabled={isRequestSended}
                >
                    {isLoading ? (
                        <img
                            width="30"
                            style={{ width: "30px" }}
                            src={LoaderImg}
                            alt="Загрузка..."
                        />
                    ) : (
                        isRequestSended ? "Запрос отправлен!" : "Пригласить"
                    )}
                </button>
            </div>

            <div className={Styles["stack-container"]}>
                <p className={Styles["text"]}>Достижения</p>
                {props.user.achieves ? (
                    props.user.achieves.map(achieve => (
                        <p key={achieve.id} >
                            {achieve.text}
                        </p>
                    ))
                ) : (
                    <p className={Styles["text-notfound"]}>Не указаны</p>
                )}
            </div>

            <div className={Styles["stack-container"]}>
                <p className={Styles["text"]}>Стэк</p>
                {props.user.skills ? (
                    props.user.skills.map(skill => (
                        <p key={skill.id} className={Styles["stack-element"]}  style={{ backgroundColor: color.background , color: color.color}}>
                            {skill.skill}
                        </p>
                    ))
                ) : (
                    <p className={Styles["text-notfound"]}>Не указан</p>
                )}
            </div>
        </div>
    );
};
