import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import style from "./NavBar.module.css";

export default function NavBar() {
    const [currentPath, setCurrentPath] = useState("/");
    useEffect(() => setCurrentPath(window.location.pathname), [currentPath]);
    function refresh() {
        setCurrentPath("/");
    }
    return (
        <nav className={style["nav-bar"]}>
            <ul>
                <li
                    className={
                        currentPath === "/main/lenta" ? style.active : ""
                    }
                >
                    <Link to="/main/lenta" onClick={refresh}>
                        <img src="/members.svg" alt="лента участников" />
                    </Link>
                </li>
                <li className={currentPath === "/main" ? style.active : ""}>
                    <Link to="/main" onClick={refresh}>
                        <img src="/profile.svg" alt="профиль" />
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
