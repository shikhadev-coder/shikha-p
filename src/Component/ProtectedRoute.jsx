import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { pathname } = useLocation();
    const loginUser = localStorage.getItem("loginUserInfo");

    if (!loginUser) {
        return <Navigate to='/login' replace state={{ path: pathname }} />;
    }

    return children;
}