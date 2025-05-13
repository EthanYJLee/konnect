import React from "react";
import { ListGroup } from "react-bootstrap";
import "../../styles/common/ThreadList.scss";

const ThreadList = ({
  threads,
  currentThreadId,
  onThreadClick,
  onAddThread,
  showAddButton,
}) => {
  return (
    <div className="thread-list">
      <ListGroup>
        {threads.map((thread) => (
          <ListGroup.Item
            key={thread._id}
            className={`list-group-item list-group-item-action thread-item ${
              thread.threadId === currentThreadId ? "current-thread" : ""
            }`}
            action
            onClick={() => onThreadClick(thread.threadId)}
          >
            <div className="thread-content">
              <span>{thread.title || "제목 없음"}</span>
            </div>
          </ListGroup.Item>
        ))}
        {showAddButton && (
          <ListGroup.Item
            className="list-group-item list-group-item-action thread-item add-thread"
            action
            onClick={onAddThread}
          >
            <div className="thread-content">
              <span>+</span>
            </div>
          </ListGroup.Item>
        )}
      </ListGroup>
    </div>
  );
};

export default ThreadList;
