import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../styles/GoogleLoginButton.scss";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const [loginKey, setLoginKey] = useState(Date.now());

  // 컴포넌트 마운트 시와 localStorage 변경 시 컴포넌트 리렌더링을 위한 키 업데이트
  useEffect(() => {
    const handleStorageChange = () => {
      setLoginKey(Date.now()); // 로컬스토리지 변경 시 키 값 업데이트
    };

    window.addEventListener("authChange", handleStorageChange);
    return () => {
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  return (
    <div className="google-btn">
      <GoogleLogin
        key={loginKey} // 이 키 값이 변경되면 컴포넌트가 재생성됨
        onSuccess={(res) => {
          const credential = res.credential;
          const url = process.env.REACT_APP_WAS_URL;
          fetch(`${url}/api/auth/google/token`, {
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
        }}
        onFailure={(err) => {
          console.error("Google login failed:", err);
        }}
        useOneTap={false} // 원탭 기능 비활성화
        autoSelect={false} // 자동 선택 비활성화
        width="100%"
        cookiePolicy={"single_host_origin"}
        prompt="select_account" // 매번 계정 선택 화면 표시
      />
    </div>
  );
};

export default GoogleLoginButton;
