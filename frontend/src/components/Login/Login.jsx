import axios from "axios";
import React, {useState} from "react";
import {connect, useDispatch} from "react-redux";
import {Link, Navigate} from "react-router-dom";
import {LOGIN_SUCCESS} from "../../actions/types.jsx";
import domain from "../../domain.js";
import Styles from "./Login.module.css";

function Login({isAuthenticated}) {
    const [err, setErr] = useState("");
    const dispatch = useDispatch();
    const [inCorrectValue, setInCorrectValue] = useState(false);
    const [Data, setData] = useState({
        username: "",
        password: "",
    });

    const accounts = [
        {username: "member", password: "member"},
        {username: "leader", password: "leader"},
        {username: "admin", password: "admin"},
    ];

    const {username, password} = Data;

    const onChange = e => setData({...Data, [e.target.name]: e.target.value});

    const onSubmit = e => {
        e.preventDefault();
        if (Data.username.trim() !== '' && Data.password.trim() !== '') {
            setInCorrectValue(false);
            const formData = {};
            formData.username = Data.username;
            formData.password = Data.password;
            axios
                .post(`${domain}/login`, formData)
                .then(res => {
                    dispatch({
                        type: LOGIN_SUCCESS,
                        payload: res.data,
                    });
                })
                .catch(err => {
                    setErr(err.response.data.text);
                });
        } else{
            setInCorrectValue(true);
        }
    };

    const onSubmitAuto = data => {
        axios
            .post(`${domain}/login`, data)
            .then(res => {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: res.data,
                });
            })
            .catch(err => {
                setErr(err.response.data.text);
            });
    };

    if (isAuthenticated) {
        return <Navigate to="/main"/>;
    }

    return (
        <div className={Styles["reg"]}>
            <div className={Styles["container"]}>
                <h1 className={Styles["title"]}>Вход</h1>
                <button
                    className={Styles["button-auto"]}
                    onClick={() => onSubmitAuto(accounts[0])}
                >
                    Участник без команды
                </button>
                <button
                    className={Styles["button-auto"]}
                    onClick={() => onSubmitAuto(accounts[1])}
                >
                    Участник - лидер команды
                </button>
                <button
                    className={Styles["button-auto"]}
                    onClick={() => onSubmitAuto(accounts[2])}
                >
                    Админ
                </button>
                <p className={Styles["text"]}>Войти в аккаунт</p>
                <form name="login" onSubmit={e => onSubmit(e)}>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Username"
                            name="username"
                            required
                            value={username}
                            id="username"
                            onChange={e => onChange(e)}
                        />
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Password"
                            name="password"
                            required
                            value={password}
                            id="password"
                            onChange={e => onChange(e)}
                        />
                    </div>
                    <button className="btn btn-primary mt-2" type="submit">
                        Войти
                    </button>
                    {inCorrectValue && <p className={Styles["text"]}>Неправильный формат данных</p>}
                    {err !== "" && <p className={Styles["text"]}>{err}</p>}
                </form>
                <p className={Styles["text"]}>
                    Нет аккаунта?{" "}
                    <Link className={Styles["link"]} to="/reg">
                        Регистрация
                    </Link>
                </p>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Login);
