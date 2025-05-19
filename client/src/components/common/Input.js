import React from "react";
import "../../styles/common/Input.scss";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  maxLength,
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`common-input ${className}`}
      {...props}
    />
  );
};

export default Input;
