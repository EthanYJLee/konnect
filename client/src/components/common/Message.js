import React from "react";
import "../../styles/common/Message.scss";

const Message = ({ content, type, timestamp, isSelected, onClick }) => {
  return (
    <div
      className={`message ${type} ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="message-content">{content}</div>
      <div className="message-timestamp">
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Message;
