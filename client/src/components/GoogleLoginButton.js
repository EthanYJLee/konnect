import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../styles/GoogleLoginButton.scss";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import GoogleButton from "react-google-button";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { t } = useTranslation();

  // useGoogleLogin 훅을 사용
  const login = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      console.log("Google Login Success via hook:", credentialResponse);

      // 액세스 토큰으로 사용자 정보 가져오기
      fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentialResponse.access_token}`,
        {
          method: "GET",
        }
      )
        .then((res) => res.json())
        .then((userInfo) => {
          console.log("Google User Info:", userInfo);

          // 서버에 인증 정보 전송
          fetch(`${process.env.REACT_APP_WAS_URL}/api/auth/google/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "access_token",
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              id: userInfo.id,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("loginType", "google");
                localStorage.setItem("email", userInfo.email);
                localStorage.setItem("userPicture", userInfo.picture);

                // AuthContext의 handleLogin 함수에 사용자 정보 전달
                handleLogin({
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                });

                navigate("/");
              } else {
                console.error("No token received from server:", data);
              }
            })
            .catch((err) => {
              console.error("Error during server authentication:", err);
            });
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
        });
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
    },
  });

  return (
    // <div className="google-login-container">
    <div className="google-btn-wrapper">
      <GoogleButton
        // onClick={login}
        label={t("login.google")}
        type="light"
        onClick={() => login()}
        style={{ width: "100% !important", borderRadius: "9px !important" }}
      />
    </div>
  );
};

export default GoogleLoginButton;
