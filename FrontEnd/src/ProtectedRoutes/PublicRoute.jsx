import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (token) {
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PublicRoute;