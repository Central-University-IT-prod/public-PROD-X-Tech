import {
    LOGIN_FAIL,
    LOGIN_SUCCESS,
    LOGOUT,
    LOGOUT_FAIL,
} from "../actions/types";

const localStorageIsAuthenticated = JSON.parse(
    localStorage.getItem("isAuthenticated"),
);
const initialState = {
    isAuthenticated: localStorageIsAuthenticated,
};

export default function MyComponent(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case LOGIN_SUCCESS:
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("JWTToken", payload.token);
            return {
                ...state,
                isAuthenticated: true,
            };
        case LOGOUT_FAIL:
            return state;

        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem("isAuthenticated");
            return {
                ...state,
                isAuthenticated: false,
            };
        default:
            return state;
    }
}
