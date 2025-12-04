import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://192.168.1.48:8081",
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            const parsed = JSON.parse(token);
            config.headers.Authorization = `Bearer ${parsed.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // örnek: 401 olursa refresh deneyelim
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = JSON.parse(localStorage.getItem("token"))?.refreshToken;

                const res = await axios.post(
                    "http://localhost:8081/refresh?token=" + refreshToken
                );

                if (res.data.success) {
                    const newToken = {
                        token: res.data.data.token,
                        refreshToken: res.data.data.refreshToken,
                    };

                    localStorage.setItem("token", JSON.stringify(newToken));

                    originalRequest.headers.Authorization = `Bearer ${newToken.token}`;

                    return axiosInstance(originalRequest);
                }
            } catch (refreshErr) {
                localStorage.removeItem("token");
                window.location.href = "/admin/logout";
            }
        }

        return Promise.reject(error);
    }
);
