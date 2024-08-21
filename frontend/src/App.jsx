import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import Lenta from "./components/Lenta/Lenta.jsx";
import Login from "./components/Login/Login.jsx";
import Reg from "./components/Registration/Reg.jsx";
import "./static/App.css";
import store from "./store.jsx";

const router = createBrowserRouter([
    {
        path: "/main",
        element: <Layout />,
        children: [
            {
                path: "/main",
                element: <Dashboard />,
            },
            {
                path: "/main/lenta",
                element: <Lenta />,
            },
        ],
    },
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/reg",
        element: <Reg />,
    },
]);

function App() {
    return (
        <>
            <Provider store={store}>
                <RouterProvider router={router}></RouterProvider>
            </Provider>
        </>
    );
}

export default App;
