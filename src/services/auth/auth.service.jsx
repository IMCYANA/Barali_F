import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const login = (email, password) => {
    return axios
    .post(`${BASE_URL}/api/auth/signin`, { email, password})
    .then(response => {
        if(response.data.accessToken) {
            localStorage.setItem("user", JSON.stringify(response.data))
        }
        return response.data;
    });
}

const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user? JSON.parse(user) : null;
}

const logout = () => {
    localStorage.removeItem("user");
}

const AuthService = {
    login,
    logout,
    getCurrentUser
}

export default AuthService;