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
        .then((response) => response.json())
        .then((userInfo) => {
          console.log("User info:", userInfo);

          // ID 토큰 대신 액세스 토큰과 사용자 정보 전송
          const url = process.env.REACT_APP_WAS_URL;
          console.log("Sending user info to backend:", userInfo);
          console.log("API URL:", `${url}/api/auth/google/token`);

          return fetch(`${url}/api/auth/google/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credential: credentialResponse.access_token, // 서버에서 기대하는 필드명으로 변경
              type: "access_token", // 서버에 액세스 토큰임을 알림
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              id: userInfo.id,
            }),
            credentials: "include",
          });
        })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            console.log("Login successful, received token:", data);
            localStorage.setItem("loginType", "google");
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email);
            window.dispatchEvent(new Event("authChange"));
            handleLogin();
            navigate("/");
          } else {
            console.error("No token received from server:", data);
          }
        })
        .catch((error) => {
          console.error("Error processing Google login:", error);
        });
    },
    onError: (error) => {
      console.error("Google login failed:", error);
    },
    flow: "implicit",
  });

  return (
    <div className="google-btn-wrapper">
      {/* react-google-button 라이브러리 사용 */}
      <GoogleButton
        type="light"
        onClick={() => login()}
        label={t("login.google", "Login with Google")}
      />
    </div>
  );
};

export default GoogleLoginButton;
