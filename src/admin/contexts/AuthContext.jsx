import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState({
        token: null,
        refreshToken: null,
    });

    const axiosInstance = axios.create({
        baseURL: "http://192.168.1.48:8081",
    });

    useEffect(() => {
        const savedToken = localStorage.getItem("token");

        if (!savedToken) {
            setLoading(false);
            return;
        }

        const parsed = JSON.parse(savedToken);
        setToken(parsed);

        const doRefresh = async () => {
            try {
                const response = await axiosInstance.post(
                    "/refresh?token=" + parsed.refreshToken
                );

                if (response.data.success) {
                    const newToken = {
                        token: response.data.data.accessToken,
                        refreshToken: response.data.data.refreshToken,
                    };

                    setToken(newToken);
                    localStorage.setItem("token", JSON.stringify(newToken));
                    setIsLoggedIn(true);
                } else {
                    logout();
                }
            } catch {
                logout();
            }

            setLoading(false);
        };

        doRefresh();
    }, []);

    const refreshToken = async () => {
        try {
            const response = await axiosInstance.post(
                "/refresh?token=" + token.refreshToken
            );

            if (response.data.success) {
                const newToken = {
                    token: response.data.data.accessToken,
                    refreshToken: response.data.data.refreshToken,
                };

                setToken(newToken);
                localStorage.setItem("token", JSON.stringify(newToken));
                setIsLoggedIn(true);
            } else {
                logout();
            }
        } catch {
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setToken({ token: null, refreshToken: null });
    };

    const value = {
        token,
        isLoggedIn,
        refreshToken,
        logout,
        isAuthenticated: isLoggedIn,
    };

    if (loading) return <div>Checking session...</div>;

    if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

export function useAuth() {
    return useContext(AuthContext);
}
