import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AlertModal from "../components/AlertModal";
import "../styles/Signup.css";

const Signup = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    body: "",
  });

  const closeModal = () => setModalInfo({ ...modalInfo, show: false });

  const checkEmailExists = () => {
    if (!email) {
      setModalInfo({
        show: true,
        title: "이메일",
        body: "이메일을 입력해주세요.",
      });
      setIsEmailChecked(false);
      setIsEmailValid(false);
      return;
    }

    axios
      .get(`http://localhost:3030/api/auth/checkEmailExists?email=${email}`)
      .then((response) => {
        if (response.data.exists) {
          setIsEmailValid(false);
          setIsEmailChecked(true);
          setModalInfo({
            show: true,
            title: "이메일 중복",
            body: "이미 존재하는 이메일입니다.",
          });
        } else {
          setIsEmailValid(true);
          setIsEmailChecked(true);
          setModalInfo({
            show: true,
            title: "확인 완료",
            body: "사용 가능한 이메일입니다.",
          });
        }
      })
      .catch(() => {
        setIsEmailValid(false);
        setIsEmailChecked(true);
        setModalInfo({
          show: true,
          title: "오류",
          body: "이메일 확인 중 오류가 발생했습니다.",
        });
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!email) {
      setModalInfo({
        show: true,
        title: "이메일",
        body: "이메일을 입력해주세요.",
      });
      return;
    }

    if (!isEmailValid) {
      setModalInfo({
        show: true,
        title: "이메일 중복 확인",
        body: "이메일 중복 확인을 먼저 해주세요.",
      });
      return;
    }

    if (!name) {
      setModalInfo({
        show: true,
        title: "이름",
        body: "이름을 입력해주세요.",
      });
      return;
    }

    if (!password) {
      setModalInfo({
        show: true,
        title: "비밀번호",
        body: "비밀번호를 입력해주세요.",
      });
      return;
    }

    if (!confirmPassword) {
      setModalInfo({
        show: true,
        title: "비밀번호 확인",
        body: "비밀번호 확인을 입력해주세요.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setModalInfo({
        show: true,
        title: "비밀번호 불일치",
        body: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    console.log("모든 조건 통과. 회원가입 진행!");
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">{t("login.signup")}</h2>

        {/* 이메일 */}
        <div className="email-check-row">
          <input
            type="email"
            placeholder={t("signup.email")}
            className={`signup-input ${
              isEmailChecked
                ? isEmailValid
                  ? "input-valid"
                  : "input-invalid"
                : ""
            }`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsEmailChecked(false);
              setIsEmailValid(null);
            }}
          />
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

        {/* 모달 */}
        <AlertModal
          show={modalInfo.show}
          onClose={closeModal}
          title={modalInfo.title}
          body={modalInfo.body}
        />

        {/* 하단 링크 */}
        <div className="bottom-links">
          <a href="/login">{t("login.login")}</a>
          <a href="#">{t("login.findId")}</a>
          <a href="#">{t("login.findPw")}</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
