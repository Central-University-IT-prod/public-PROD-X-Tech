import axios from "axios";
import { useEffect, useState } from "react";
import domain from "../../domain";
import { List } from "../List/List";
import MainLoader from "../Loader/MainLoader";
import Style from "./Lenta.module.css";

export default function Lenta() {
    const [list, setList] = useState({});
    const [filterList, setFilterList] = useState({});
    const [error, setError] = useState({ isError: false, mess: "" });
    const [isLoading, setIsLoading] = useState(false);

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("JWTToken")}`,
        },
    };
    const getArrayStack = user => {
        if (user.skills) {
            console.log(
                "array",
                user,
                user.skills.map(skill => skill.skill),
            );
            return user.skills.map(skill => skill.skill.toLowerCase());
        }
        return [""];
    };
    const sort = filter => {
        // console.log(filter, list);
        // console.log(
        //     "filter",
        //     list.list.filter(user => user.specialization === filter),
        //     filter,
        // );
        if (filter.stack === "") {
            setFilterList({
                type: list.type,
                list: list.list.filter(
                    user => user?.specialization === filter.spec,
                ),
            });
            if (filter.spec === "all") {
                setFilterList(list);
            }
        } else {
            console.log("FILTER", filter);
            const newList = {
                type: list.type,
                list: [],
            };
            list.list.forEach(user => {
                if (filter.spec === "all") {
                    if (
                        getArrayStack(user).includes(filter.stack.toLowerCase())
                    ) {
                        newList.list.push(user);
                    }
                } else {
                    if (
                        user?.specialization === filter.spec &&
                        getArrayStack(user).includes(filter.stack.toLowerCase())
                    ) {
                        newList.list.push(user);
                    }
                }
            });
            console.log("new", newList);
            setFilterList(newList);
            // console.log(
            //     "list",
            //     list.list.filter(user =>
            //         getArrayStack(user).includes(filter.stack),
            //     ),
            // );
            // if (filter.spec === "all") {
            //     setFilterList(list);
            // }
        }
        // console.log("asd", { type: list.type, list: [list.list[0]] });
        // setList({ type: list.type, list: [list.list[0]] });
    };
    const requestLenta = () => {
        setIsLoading(true);
        axios
            .get(`${domain}/feed`, config)
            .then(res => {
                console.log(res);
                setError({ isError: false, mess: "" });
                setList(res.data);
                setFilterList(res.data);
            })
            .catch(err => {
                setError({ isError: true, mess: err.response.data.text });
            })
            .finally(() => setIsLoading(false));
    };
    useEffect(() => {
        requestLenta();
    }, []);
    // console.log(list);
    return (
        <>
            {isLoading && <MainLoader />}
            {!error.isError && !isLoading && (
                <>
                    <List sort={sort} list={filterList} />
                </>
            )}

            {error.isError && (
                <div className={Style["container"]}>
                    <p className={Style["error-text"]}>{error.mess}</p>
                </div>
            )}
        </>
    );
}
