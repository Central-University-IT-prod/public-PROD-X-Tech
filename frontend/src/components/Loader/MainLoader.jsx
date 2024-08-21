import Style from "./Loader.module.css";
export default function Loader() {
    return (
        <div className={Style["container"]}>
            <span className={Style["loader"]}></span>
        </div>
    );
}
