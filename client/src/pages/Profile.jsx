import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";


const Profile = () => {
    return (
        <div className="profile-container" style={{alignItems:"center"}}>
            <h1>Profile</h1>
        </div>
    );
}
export default Profile;