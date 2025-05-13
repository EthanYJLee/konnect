// 로그인하지 않은 경우만 접근 (로그인 화면)
import { Navigate } from "react-router-dom";

const GuestOnlyRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

export default GuestOnlyRoute;
