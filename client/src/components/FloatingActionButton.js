import React from "react";
import "../styles/FloatingActionButton.scss";

const FloatingActionButton = ({ onClick, icon = "", count = 0 }) => {
  return (
    <button className="floating-button" onClick={onClick}>
      <div className="btn-icon">{icon}</div>
      {/* {count > 0 && <div className="fab-badge">{count}</div>} */}
      <div className="fab-badge">{count}</div>
    </button>
  );
};

export default FloatingActionButton;
