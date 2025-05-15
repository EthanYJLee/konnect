import React from "react";
import { ListGroup } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import "../../styles/common/ThreadList.scss";

const ThreadList = ({
  threads,
  currentThreadId,
  onThreadClick,
  onAddThread,
  onDeleteThread,
  showAddButton,
}) => {
  const handleDeleteClick = (e, threadId) => {
    e.stopPropagation(); // Prevent thread click event
    onDeleteThread(threadId);
  };

  return (
    <div className="thread-list">
      <ListGroup>
        {threads.map((thread) => (
          <div
            key={thread._id}
            className={`list-group-item list-group-item-action thread-item ${
              thread.threadId === currentThreadId ? "current-thread" : ""
            }`}
            onClick={() => onThreadClick(thread.threadId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onThreadClick(thread.threadId);
              }
            }}
          >
            <div className="thread-content">
              <span>{thread.title || "제목 없음"}</span>
              <button
                className="delete-thread-btn"
                onClick={(e) => handleDeleteClick(e, thread.threadId)}
                title="Delete thread"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        {showAddButton && (
          <div
            className="list-group-item list-group-item-action thread-item add-thread"
            onClick={onAddThread}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onAddThread();
              }
            }}
          >
            <div className="thread-content">+</div>
          </div>
        )}
      </ListGroup>
    </div>
  );
};

export default ThreadList;
