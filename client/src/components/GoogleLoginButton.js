import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../styles/GoogleLoginButton.scss";
import { useAuth } from "../contexts/AuthContext";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const { handleLogin } = useAuth();

  return (
    <div className="google-btn">
      <GoogleLogin
        onSuccess={(res) => {
          const credential = res.credential;
          fetch("http://localhost:3030/api/auth/google/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.token) {
                localStorage.setItem("loginType", "google");
                localStorage.setItem("token", data.token);
                localStorage.setItem("email", data.email);
                window.dispatchEvent(new Event("authChange"));
                handleLogin();
                navigate("/");
              }
            })
            .catch(console.error);
          console.log("res", res);
        }}
        onFailure={(err) => {
          console.log(err);
        }}
        useOneTap={false}
        width="100%"
      />
    </div>
  );
};

export default GoogleLoginButton;
