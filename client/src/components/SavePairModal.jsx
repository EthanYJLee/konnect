import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/SavePairModal.scss";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";

const SavePairModal = ({
  show,
  onClose,
  selectedMessagePairIndex,
  messagePair,
}) => {
  const { theme, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");
  const threadId = localStorage.getItem("assistant_thread");

  const onSave = async () => {
    // console.log(messagePair);
    // console.log(selectedMessagePairIndex);
    const selectedPairs = selectedMessagePairIndex.map(
      (idx) => messagePair[idx]
    );

    try {
      const response = await axios.post(
        "http://localhost:3030/api/history/savePairs",
        { pairs: selectedPairs, threadId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("💾 저장된 페어:", selectedPairs);
      console.log("서버 응답:", response.data);
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  return (
    <div className="save-message-modal">
      <Modal show={show} onHide={onClose}>
        <Modal.Header className={`modal-header ${theme}`} closeButton>
          <Modal.Title>저장</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div>
            {selectedMessagePairIndex.map((pairIndex) => {
              const pair = messagePair[pairIndex];
              return (
                <div key={pairIndex} className="message-pair-preview">
                  {pair.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                      <strong>{msg.type === "user" ? "💬" : "🤖"}</strong>:{" "}
                      {msg.content}
                    </div>
                  ))}
                  <hr className="modal-body-hr" />
                </div>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave();
              onClose();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SavePairModal;
