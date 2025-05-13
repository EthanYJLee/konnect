import React from "react";
import "../styles/Badge.scss";

function Badge({ className = "", children, ...props }) {
  return (
    <div className={`badge badge-${className}`} {...props}>
      {children}
    </div>
  );
}

export default Badge;
