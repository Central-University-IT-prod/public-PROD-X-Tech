import { useState } from "react";
import { TeamCard } from "../TeamCard/TeamCard";
import { UserCard } from "../UserCard/UserCard";
import Styles from "./List.module.css";

export const List = props => {
    console.log(props.list.list);
    const [filter, setFilter] = useState({ spec: "all", stack: "" });
    return (
        <>
            <h1 className={Styles["title"]}>
                {props.list.list && props.list.type === "users"
                    ? "Список участников без команды"
                    : "Список команд"}
            </h1>
            {props.list.list && props.list.type === "users" && (
                <>
                    <div className={Styles["dropdown-container"]}>
                        <select
                            className={Styles["dropdown"]}
                            name="filter"
                            id="filter"
                            onChange={e => {
                                setFilter({
                                    spec: e.target.value,
                                    stack: filter.stack,
                                });
                                props.sort({
                                    spec: e.target.value,
                                    stack: filter.stack,
                                });
                            }}
                        >
                            <option value="all">Все</option>
                            <option value="Frontend">frontend</option>
                            <option value="Backend">backend</option>
                            <option value="Mobile">mobile</option>
                        </select>
                    </div>

                    <input
                        className={Styles["filter-input"]}
                        placeholder="Поиск по стэку"
                        type="text"
                        onInput={e => {
                            setFilter({
                                spec: filter.spec,
                                stack: e.target.value,
                            });
                            props.sort({
                                spec: filter.spec,
                                stack: e.target.value,
                            });
                        }}
                    />
                </>
            )}

            <div className={Styles["container"]}>
                {props.list.list &&
                    props.list.list.length > 0 &&
                    props.list.type === "users" &&
                    props.list.list.map(user => (
                        <UserCard key={user.id} user={user} />
                    ))}

                {props.list.list &&
                    props.list.list.length > 0 &&
                    props.list.type === "teams" &&
                    props.list.list.map(team => (
                        <TeamCard key={team.id} team={team} />
                    ))}
            </div>
            {props.list.list &&
                props.list.list.length === 0 &&
                props.list.type === "users" && (
                    <p className={Styles["err-mess"]}>
                        Нет свободных участников
                    </p>
                )}
            {props.list.list &&
                props.list.list.length === 0 &&
                props.list.type === "teams" && (
                    <p className={Styles["err-mess"]}>Нет команд</p>
                )}
        </>
    );
};
