import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../styles/GoogleLoginButton.scss";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

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
                localStorage.setItem("token", data.token);
                window.dispatchEvent(new Event("authChange"));
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
