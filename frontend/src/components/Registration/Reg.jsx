import axios from "axios";
import {useState} from "react";
import {connect, useDispatch} from "react-redux";
import {Link, Navigate} from "react-router-dom";
import {LOGIN_FAIL, LOGIN_SUCCESS} from "../../actions/types.jsx";
import domain from "../../domain.js";
import Styles from "./Reg.module.css";

export const MainPage = ({isAuthenticated}) => {
    const [err, setErr] = useState("");
    const dispatch = useDispatch();
    const [inCorrectPassword, setInCorrectPassword] = useState(false);
    const [inCorrectValue, setInCorrectValue] = useState(false);
    const [Data, setData] = useState({
        fio: "",
        username: "",
        tg: "",
        password: "",
        re_password: "",
    });

    const {fio, username, tg, password, re_password} = Data;

    const onChange = e => setData({...Data, [e.target.name]: e.target.value});
    const onSubmit = e => {
        e.preventDefault();

        if (password === re_password) {
            setInCorrectPassword(false);
            if (Data.fio.trim() !== '' && Data.username.trim() !== '' && Data.password.trim() !== '' &&
                Data.tg.trim() !== '') {
                setInCorrectValue(false);
                const formData = {};
                formData.fio = Data.fio;
                formData.username = Data.username;
                formData.password = Data.password;
                axios
                    .post(`${domain}/register`, formData)
                    .then(res => {
                        console.log(res);
                        const body = {};
                        body.username = Data.username;
                        body.password = Data.password;
                        axios
                            .post(`${domain}/login`, body)
                            .then(res => {
                                dispatch({
                                    type: LOGIN_SUCCESS,
                                    payload: res.data,
                                });
                                const config = {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
                                    },
                                };
                                const formData = {};
                                formData.tg = Data.tg;
                                axios
                                    .patch(`${domain}/editabout`, formData, config)
                                    .catch(err => {
                                        setErr(err.response.data.text);
                                    });
                            })
                            .catch(err => {
                                console.error(err);
                                setErr(err.response.data.text);
                                dispatch({
                                    type: LOGIN_FAIL,
                                });
                            });
                    })
                    .catch(err => {
                        setErr(err.response.data.text);
                    });
            } else{
                setInCorrectValue(true);
            }
        } else {
            setInCorrectPassword(true);
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/main"/>;
    }
    return (
        <section className={Styles["reg"]}>
            <div className={Styles["container"]}>
                <h1 className={Styles["title"]}>Регистрация</h1>
                <p className={Styles["text"]}>Создай свой аккаунт</p>
                <form onSubmit={e => onSubmit(e)}>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="ФИО"
                            name="fio"
                            value={fio}
                            onChange={e => onChange(e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Логин"
                            name="username"
                            value={username}
                            onChange={e => onChange(e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Логин Телеграмма, начинающийся с @"
                            name="tg"
                            value={tg}
                            onChange={e => onChange(e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Пароль"
                            name="password"
                            value={password}
                            onChange={e => onChange(e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Повторите пароль"
                            name="re_password"
                            value={re_password}
                            onChange={e => onChange(e)}
                            required
                        />
                    </div>
                    {inCorrectValue && <p style={{color: 'white'}}>Неправильный формат данных</p>}
                    {inCorrectPassword && (
                        <p style={{color: 'white'}} className="text"> Пароли не совпадают</p>
                    )}
                    <button className="btn-primary mt-2" type="submit">
                        Зарегистрироваться
                    </button>
                    {err !== "" && <p className={Styles["text"]}>{err}</p>}
                </form>
                <p className={Styles["text"]}>
                    Уже зарегистрированы?{" "}
                    <Link className={Styles["link"]} to="/">
                        Войти в аккаунт
                    </Link>
                </p>
            </div>
        </section>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(MainPage);
