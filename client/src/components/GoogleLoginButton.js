import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../styles/GoogleLoginButton.scss";

const GoogleLoginButton = () => {
  const clientId = "clientId";
  const navigate = useNavigate();

  return (
    <div className="google-btn">
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}
      >
        <GoogleLogin
          onSuccess={(res) => {
            console.log("res", res);
            // handleGoogleLogin();
            navigate("/");
          }}
          onFailure={(err) => {
            console.log(err);
          }}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleLoginButton;
