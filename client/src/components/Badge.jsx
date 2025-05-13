import React, { useEffect, useState } from "react";
import "../styles/Badge.scss";

function Badge({ pair, cat, onClick, ...props }) {
  return (
    <button
      className={`custom-badge badge-${pair.category}`}
      {...props}
      onClick={onClick}
    >
      {pair.category}
    </button>
  );
}

export default Badge;
