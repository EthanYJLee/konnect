import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { Modal, Button, ProgressBar, Alert } from "react-bootstrap";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5분 = 300초
  const [sessionExtendError, setSessionExtendError] = useState(false); // 세션 연장 오류 상태
  const timerRef = useRef(null);
  const warningTimeoutRef = useRef(null); // 경고 타이머 참조
  const logoutTimeoutRef = useRef(null); // 로그아웃 타이머 참조
  const { t } = useTranslation();

  // 컴포넌트 마운트 시 구글 클라이언트 ID 확인
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;
    console.log(
      "AuthContext - Google Client ID:",
      clientId ? "설정됨" : "설정되지 않음"
    );
  }, []);

  const handleLogout = () => {
    // 모든 타이머 정리
    clearAllTimers();

    const email = localStorage.getItem("email");

    if (localStorage.getItem("loginType") === "google") {
      // 구글 로그아웃 - 현재 앱에서만 로그아웃
      googleLogout();

      // 토큰 취소(revoke) - 앱에 부여된 권한만 취소
      if (window.google?.accounts?.id && email) {
        window.google.accounts.id.revoke(email, () => {
          console.log("✅ Google session revoked");
        });
      }

      // 구글 계정 관련 설정 초기화 - 현재 앱 범위 내에서만
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        window.google.accounts.id.disableAutoSelect();
        window.google.accounts.id.cancel(); // 현재 진행중인 로그인 프로세스 취소

        try {
          // 현재 앱의 인증 상태만 초기화
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID,
            auto_select: false,
            ux_mode: "popup",
          });
        } catch (e) {
          console.error("Google OAuth cleanup error:", e);
        }
      }

      // 현재 앱 관련 로컬 스토리지만 정리
      localStorage.removeItem("token");
      localStorage.removeItem("assistant_thread");
      localStorage.removeItem("loginType");
      localStorage.removeItem("email");
      localStorage.removeItem("userPicture");
      localStorage.removeItem("userName");

      // 앱 상태 업데이트
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("authChange"));
    } else if (localStorage.getItem("loginType") === "normal") {
      localStorage.removeItem("token");
      localStorage.removeItem("assistant_thread");
      localStorage.removeItem("loginType");
      localStorage.removeItem("email");
      localStorage.removeItem("userPicture");
      localStorage.removeItem("userName");

      setIsLoggedIn(false);
      window.dispatchEvent(new Event("authChange"));
    }

    // 모달이 열려있다면 닫기
    if (showSessionModal) {
      setShowSessionModal(false);
    }

    navigate("/");
  };

  // 모든 타이머 정리 함수
  const clearAllTimers = () => {
    // 카운트다운 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 경고 타이머 정리
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    // 로그아웃 타이머 정리
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);

    // 사용자 프로필 이미지가 있으면 로컬 스토리지에 저장
    if (userData?.picture) {
      localStorage.setItem("userPicture", userData.picture);
    }

    // 사용자 이름이 있으면 로컬 스토리지에 저장
    if (userData?.name) {
      localStorage.setItem("userName", userData.name);
    }
  };

  // 세션 만료 타이머 설정 함수
  const setSessionExpiryTimers = (expiresAt) => {
    // 이전 타이머 모두 정리
    clearAllTimers();

    const now = Date.now();
    const delay = expiresAt - now;

    if (delay > 0) {
      // 5분 = 300,000ms
      const fiveMinutes = 5 * 60 * 1000;

      // 만료 5분 전에 경고
      if (delay > fiveMinutes) {
        console.log(
          "Setting new warning timer for",
          new Date(now + delay - fiveMinutes)
        );
        warningTimeoutRef.current = setTimeout(() => {
          setShowSessionModal(true);
          startCountdown();
        }, delay - fiveMinutes);

        console.log("Setting new logout timer for", new Date(now + delay));
        logoutTimeoutRef.current = setTimeout(() => handleLogout(), delay);
      } else {
        // 이미 만료 5분 이내라면 바로 알림 표시
        setShowSessionModal(true);
        startCountdown();

        console.log("Setting new logout timer for", new Date(now + delay));
        logoutTimeoutRef.current = setTimeout(() => handleLogout(), delay);
      }
    }
  };

  // 세션 연장 함수
  const extendSession = async () => {
    try {
      // 이전 오류 메시지 초기화
      setSessionExtendError(false);

      const token = localStorage.getItem("token");
      const url = process.env.REACT_APP_WAS_URL;

      // 요청 전 로깅
      console.log(
        "Attempting to extend session with token",
        token ? "exists" : "missing"
      );

      try {
        // 서버에 토큰 갱신 요청
        const response = await axios.post(`${url}/api/auth/refresh`, { token });

        if (response.data?.token) {
          // 새 토큰 저장
          localStorage.setItem("token", response.data.token);

          // 모달 닫기
          setShowSessionModal(false);

          // 카운트다운 타이머 정리
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          console.log("✅ Session extended for another hour");

          // JWT 만료 타이머 재설정
          const payload = JSON.parse(atob(response.data.token.split(".")[1]));
          const expiresAt = payload.exp * 1000;

          // 새로운 타이머 설정
          setSessionExpiryTimers(expiresAt);
        }
      } catch (serverError) {
        console.error("Server refresh failed:", serverError);

        // 서버 연결 실패 시 디버깅 정보 출력
        console.log("Server error details:", {
          status: serverError.response?.status,
          message: serverError.response?.data?.message || serverError.message,
          isNetworkError: !serverError.response,
        });

        // 서버 연결 실패 시 로컬에서 비상 응급 토큰 생성 시도 (개발용)
        if (!serverError.response && process.env.NODE_ENV === "development") {
          // 기존 토큰에서 사용자 ID 등 정보 추출 시도
          try {
            console.log(
              "Attempting emergency local token extension (DEV ONLY)"
            );
            const currentToken = localStorage.getItem("token");

            if (currentToken) {
              // 토큰 페이로드 디코딩
              const payload = JSON.parse(atob(currentToken.split(".")[1]));

              // 현재 시간 + 1시간으로 만료 시간 설정
              const nowInSeconds = Math.floor(Date.now() / 1000);
              const oneHourFromNow = nowInSeconds + 3600;

              // 새 페이로드 생성 (기존 ID 유지, 만료 시간만 갱신)
              const newPayload = {
                ...payload,
                iat: nowInSeconds,
                exp: oneHourFromNow,
              };

              // 간단한 토큰 형식으로 재생성 (서명은 실제로 검증되지 않음, 개발용)
              const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
              const newPayloadStr = btoa(JSON.stringify(newPayload));
              const mockSignature = btoa("emergency_extension"); // 실제 서명이 아님

              const emergencyToken = `${header}.${newPayloadStr}.${mockSignature}`;
              localStorage.setItem("token", emergencyToken);

              // 모달 닫기
              setShowSessionModal(false);

              // 모든 타이머 정리
              clearAllTimers();

              console.log("⚠️ Emergency token extension complete (DEV ONLY)");

              // 새로운 만료 시간(1시간 후)
              const newExpiresAt = oneHourFromNow * 1000;

              // 새로운 타이머 설정
              setSessionExpiryTimers(newExpiresAt);

              // 성공으로 처리하고 종료
              return;
            }
          } catch (localExtensionError) {
            console.error("Local extension failed:", localExtensionError);
          }
        }

        // 서버 및 로컬 모두 실패한 경우 오류 표시
        setSessionExtendError(true);
      }
    } catch (error) {
      console.error("Client-side extension error:", error);
      setSessionExtendError(true);
    }
  };

  // 5분 카운트다운 타이머 시작
  const startCountdown = () => {
    setRemainingSeconds(300); // 5분으로 초기화

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 시간 형식 변환 (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  // JWT 만료 타이머 설정
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiresAt = payload.exp * 1000;

        // 세션 만료 타이머 설정
        setSessionExpiryTimers(expiresAt);

        // 컴포넌트 언마운트 시 모든 타이머 정리
        return () => {
          clearAllTimers();
        };
      } catch (error) {
        console.error("토큰 처리 중 오류 발생:", error);
        handleLogout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
      {children}

      {/* 세션 만료 모달 */}
      <Modal show={showSessionModal} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>{t("session.expireTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("session.expireMessage")}</p>
          <p>
            {t("session.remainingTime")} {formatTime(remainingSeconds)}
          </p>
          <ProgressBar
            now={remainingSeconds}
            max={300}
            variant={remainingSeconds < 60 ? "danger" : "warning"}
            style={{ height: "10px" }}
          />

          {/* 세션 연장 오류 알림 */}
          {sessionExtendError && (
            <Alert variant="danger" className="mt-3">
              {t("session.extendError")}
              <div className="mt-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={extendSession}
                  className="me-2"
                >
                  {t("session.retry")}
                </Button>
                <small className="text-muted">{t("session.orLogout")}</small>
              </div>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLogout}>
            {t("session.logout")}
          </Button>
          <Button
            variant="primary"
            onClick={extendSession}
            disabled={sessionExtendError}
          >
            {t("session.extend")}
          </Button>
        </Modal.Footer>
      </Modal>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
