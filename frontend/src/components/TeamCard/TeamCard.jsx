import axios from "axios";
import { useState } from "react";
import domain from "../../domain";
import Styles from "./TeamCard.module.css";
import { User } from "./User";
import LoaderImg from "/loader.gif";

export const TeamCard = props => {
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
    const sendRequest = () => {
        setIsLoading(true);
        axios
            .post(`${domain}/inteampetition/${props.team.id}`, {}, config)
            .then(res => {
                console.log(res);
            })
            .catch(err => console.log(err))
            .finally(() => setIsLoading(false));
    };
    return (
        <div className={Styles["container"]}>
            <img src={LoaderImg} style={{ display: "none" }} />
            <div className={Styles["title-container"]}>
                <p className={Styles["team-name"]}>{props.team.name}</p>
                <p className={Styles["places-text"]}>
                    {props.team.members.length}/5
                </p>
            </div>
            <div className={Styles["users"]}>
                {props.team.members.map((user, index) => (
                    <User key={user} userId={user} userIndex={index} />
                ))}
            </div>
            <button onClick={e=>{sendRequest(); handleRequestSend()}} className={Styles["send"]} disabled={isRequestSended}>
                {isLoading ? (
                    <img
                        width="30"
                        style={{ width: "30px" }}
                        src={LoaderImg}
                        alt="Загрузка..."
                    />
                ) : (
                    isRequestSended ? "Заявка отправлена!" : "Отправить заявку"
                )}
            </button>
        </div>
    );
};
