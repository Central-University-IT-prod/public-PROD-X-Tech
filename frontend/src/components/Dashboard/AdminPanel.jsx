import axios from "axios"
import {useEffect, useState} from "react"
import {useDispatch} from "react-redux"
import {LOGOUT} from "../../actions/types.jsx"
import domain from "../../domain.js"
import Styles from "./AdminPanel/AdminPanel.module.css"
import LoadUsers from './AdminPanel/LoadUsers.jsx'
import MainLoader from "../Loader/MainLoader.jsx";

export default function AdminPanel() {
    const dispatch = useDispatch();
    const [visibleUploadFile, setVisibleUploadFile] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successUpload, setSuccessupload] = useState(false);
    const [isLoadUser, setIsLoadUser] = useState(false);
    const [user, setUser] = useState({});
    const [graphic, setGraphic] = useState(false);
    const [isLoader, setIsLoader] = useState(false)

    const config = {
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    };

    useEffect(() => {
        setIsLoader(true)
        axios.get(`${domain}/me`, config)
            .then(res => {
                setUser({
                    id: res.data.userid,
                    name: res.data.username
                })
            }).finally(() => setIsLoader(false))
        document.getElementById('statistics').click();
    }, []);

    function handleFileChange(event) {
        setFile(event.target.files[0]);
    }

    // file upload
    function UploadFile(e) {
        e.preventDefault();
        const formData = {};
        formData.file = file;
        setLoading(true);
        setSuccessupload(false);
        axios.post(`${domain}/admin/uploadparty`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
                'Content-Type': 'multipart/form-data'
            }
        }).finally(() => {
            setLoading(false);
            setSuccessupload(true);
        })
    }

    function Graphs() {
        return (
            <>
                <h2 className={Styles['users-count']}></h2>
                <div className={Styles['graphs-container']}>
                    <img src={"http://prod-x.tech:8082/api/plot/specialization"} alt=""
                         className={Styles['graph-image']}/>
                    <img src={"http://prod-x.tech:8082/api/plot/team"} alt="" className={Styles['graph-image']}/>
                </div>
            </>
        )
    }

    function File() {
        return (
            <form className={Styles['filelUpoad-form']} onSubmit={UploadFile}>
                <input type="file" onChange={handleFileChange}/>
                <button type={"submit"}>Сохранить</button>
                {loading &&
                    <div>
                        <p>Загрузка...</p>
                    </div>
                }
                {successUpload && <p>Сохранено</p>}
            </form>
        );
    }

    function UploadButton() {
        setVisibleUploadFile(!visibleUploadFile);
        setSuccessupload(false);
    }

    function showPage(num) {
        if (num === 1) {
            setIsLoadUser(true);
            setGraphic(false);
        } else {
            setGraphic(true);
            setIsLoadUser(false);
        }
    }

    function HandleLogout() {
        dispatch({type: LOGOUT});
    }

    return (
        <div
            className={Styles["container"]}
            style={{
                color: "white",
            }}
        >
            <section className={Styles["actions-container"]}>
                <div className={Styles['main-section']}>
                <div className={Styles['username-container']}>
                    <p className={Styles['username-title']}>{user.name}</p>
                </div>
                <div>
                    <button className={Styles["actions-button"]}
                            onClick={UploadButton}>
                        Загрузить список финалистов
                    </button>
                    {visibleUploadFile && <File/>}
                </div>
                <div>
                    <button className={Styles["actions-button"]} onClick={() => showPage(1)}>
                        Администрирование участников
                    </button>
                </div>
                <div>
                    <button className={Styles["actions-button"]} id={'statistics'} onClick={() => showPage(2)}>
                        Статистика
                    </button>
                </div>
                <div>
                </div>
                </div>
                <button id={Styles['logout-btn']} className={Styles["actions-button"]} onClick={HandleLogout}>
                    Выйти из аккаунта
                </button>
            </section>
            <section className={Styles['dashboard-container']}>
                <h1 className={Styles["page-title"]}> Admin panel </h1>
                <div className={Styles['list-users']}>
                    {isLoader ? <MainLoader/> : (
                        <>
                            {isLoadUser && <LoadUsers/>}
                            {graphic && <Graphs/>}
                        </>
                    )}
                </div>
            </section>

        </div>
    )
}


