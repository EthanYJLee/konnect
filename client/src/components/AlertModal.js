import React from "react";
import { Modal, Button } from "react-bootstrap";

const AlertModal = ({
  show,
  onClose,
  title,
  body,
  onConfirm,
  confirmText = "확인",
  cancelText = "취소",
}) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        {onConfirm && (
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;
