import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import NavBar from "./NavBar/NavBar";

// checkAuthenticated, load_user,
export default function Layout() {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    return (
        <div>
            {!isAuthenticated && <Navigate to={"/"} />}
            <NavBar />
            <Outlet />
        </div>
    );
}
