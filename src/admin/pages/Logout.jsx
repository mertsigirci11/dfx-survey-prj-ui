import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("token");
        navigate("/admin/login", { replace: true });
    }, []);

    return null;
}
