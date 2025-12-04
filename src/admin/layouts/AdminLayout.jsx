import { Outlet } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

export default function AdminLayout() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
