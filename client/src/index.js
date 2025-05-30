import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// 다국어 지원을 위한 i18n 초기화
import "./i18n/config";

const root = ReactDOM.createRoot(document.getElementById("root"));
const googleClientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;

console.log("Google Client ID:", googleClientId); // 디버깅용 로그 추가

root.render(
  // <React.StrictMode>
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
