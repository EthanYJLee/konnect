import { Navigate } from "react-router-dom";

const LoginRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
};

export default LoginRoute;