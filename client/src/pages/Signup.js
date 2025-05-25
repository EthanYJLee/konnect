import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AlertModal from "../components/AlertModal";
import "../styles/Signup.scss";

// ... import 생략 ...

const Signup = () => {
  const { t } = useTranslation();

  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [customDomain, setCustomDomain] = useState("");
  const [useCustomDomain, setUseCustomDomain] = useState(false);

  const email = `${emailId}@${useCustomDomain ? customDomain : emailDomain}`;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,}$/i;
  const passwordRegEx = /^[A-Za-z0-9]{8,20}$/;

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    body: "",
  });

  const closeModal = () => setModalInfo({ ...modalInfo, show: false });

  const checkEmailExists = () => {
    if (!emailId || (useCustomDomain && !customDomain)) {
      setModalInfo({
        show: true,
        title: t("signup.modal.emailTitle"),
        body: t("signup.modal.emailInputError"),
      });
      setIsEmailChecked(true);
      setIsEmailValid(false);
      return;
    }
    const url = process.env.REACT_APP_WAS_URL;
    axios
      .get(`${url}/api/auth/checkEmailExists?email=${email}`)
      .then((response) => {
        if (response.data.exists) {
          setIsEmailValid(false);
          setIsEmailChecked(true);
          setModalInfo({
            show: true,
            title: t("signup.modal.emailDuplicateTitle"),
            body: t("signup.modal.emailDuplicateBody"),
          });
        } else {
          if (emailRegEx.test(email)) {
            setIsEmailValid(true);
            setIsEmailChecked(true);
            setModalInfo({
              show: true,
              title: t("signup.modal.emailAvailableTitle"),
              body: t("signup.modal.emailAvailableBody"),
            });
          } else {
            setIsEmailValid(false);
            setIsEmailChecked(true);
            setModalInfo({
              show: true,
              title: t("signup.modal.emailFormatErrorTitle"),
              body: t("signup.modal.emailFormatErrorBody"),
            });
          }
        }
      })
      .catch(() => {
        setIsEmailValid(false);
        setIsEmailChecked(true);
        setModalInfo({
          show: true,
          title: t("signup.modal.emailCheckErrorTitle"),
          body: t("signup.modal.emailCheckErrorBody"),
        });
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!emailId || (useCustomDomain && !customDomain)) {
      setModalInfo({
        show: true,
        title: t("signup.modal.emailInputTitle"),
        body: t("signup.modal.emailInputBody"),
      });
      return;
    }

    if (!isEmailValid) {
      setModalInfo({
        show: true,
        title: t("signup.modal.emailCheckTitle"),
        body: t("signup.modal.emailCheckBody"),
      });
      return;
    }

    if (!name) {
      setModalInfo({
        show: true,
        title: t("signup.modal.nameTitle"),
        body: t("signup.modal.nameBody"),
      });
      return;
    }

    if (!password) {
      setModalInfo({
        show: true,
        title: t("signup.modal.passwordTitle"),
        body: t("signup.modal.passwordBody"),
      });
      return;
    }

    if (!confirmPassword) {
      setModalInfo({
        show: true,
        title: t("signup.modal.confirmPasswordTitle"),
        body: t("signup.modal.confirmPasswordBody"),
      });
      return;
    }

    if (password !== confirmPassword) {
      setModalInfo({
        show: true,
        title: t("signup.modal.passwordMismatchTitle"),
        body: t("signup.modal.passwordMismatchBody"),
      });
      return;
    }

    console.log("최종 이메일:", email);
    console.log("회원가입 요청 보내기...");
    const url = process.env.REACT_APP_WAS_URL;
    axios
      .post(`${url}/api/auth/register`, {
        email: email,
        username: name,
        password: password,
      })
      .then((response) => {
        console.log("회원가입 성공:", response.data);
      })
      .catch((error) => {
        console.error("회원가입 실패:", error);
      });
  };

  return (
    <div className="signup-container">
      <h1>{t("signup.title")}</h1>
      <p>{t("signup.subtitle")}</p>
      <div className="signup-box">
        {/* 이메일 입력 */}
        <div className="email-check-row">
          <input
            type="text"
            placeholder={t("signup.email")}
            className={`signup-input ${
              isEmailChecked
                ? isEmailValid
                  ? "input-valid"
                  : "input-invalid"
                : ""
            }`}
            value={emailId}
            onChange={(e) => {
              setEmailId(e.target.value);
              setIsEmailChecked(false);
              setIsEmailValid(null);
            }}
          />
          <div className="at-symbol">@</div>

          {useCustomDomain ? (
            <input
              type="text"
              placeholder={t("signup.customDomain")}
              className="signup-email-domain custom-domain-input"
              value={customDomain}
              onChange={(e) => {
                setCustomDomain(e.target.value);
                setIsEmailChecked(false);
                setIsEmailValid(null);
              }}
            />
          ) : (
            <select
              className="signup-email-domain"
              value={emailDomain}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setUseCustomDomain(true);
                  setCustomDomain(""); // reset
                } else {
                  setEmailDomain(value);
                }
                setIsEmailChecked(false);
                setIsEmailValid(null);
              }}
            >
              <option value="gmail.com">gmail.com</option>
              <option value="yahoo.com">yahoo.com</option>
              <option value="outlook.com">outlook.com</option>
              <option value="naver.com">naver.com</option>
              <option value="daum.net">daum.net</option>
              <option value="custom">{t("signup.customDomain")}</option>
            </select>
          )}

          {useCustomDomain && (
            <button
              className="domain-toggle-btn"
              onClick={() => {
                setUseCustomDomain(false);
                setEmailDomain("gmail.com");
              }}
            >
              ↩
            </button>
          )}

          <button className="check-duplicate-btn" onClick={checkEmailExists}>
            {t("signup.checkDuplicate")}
          </button>
        </div>

        {/* 이름 */}
        <input
          type="text"
          placeholder={t("signup.name")}
          className={`signup-input ${name ? "input-valid" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* 비밀번호 */}
        <input
          type="password"
          placeholder={t("signup.password")}
          className={`signup-input ${password ? "input-valid" : ""}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 비밀번호 확인 */}
        <input
          type="password"
          placeholder={t("signup.confirmPassword")}
          className={`signup-input ${
            confirmPassword
              ? password === confirmPassword
                ? "input-valid"
                : "input-invalid"
              : ""
          }`}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="signup-btn" onClick={handleSignup}>
          {t("login.signup")}
        </button>

        <AlertModal
          show={modalInfo.show}
          onClose={closeModal}
          title={modalInfo.title}
          body={modalInfo.body}
        />

        <div className="bottom-links">
          <a href="/login">{t("login.login")}</a>
          {/* <a href="#">{t("login.findId")}</a>
          <a href="#">{t("login.findPw")}</a> */}
        </div>
      </div>
    </div>
  );
};

export default Signup;
