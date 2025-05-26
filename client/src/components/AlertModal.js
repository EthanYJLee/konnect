import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const AlertModal = ({
  show,
  onClose,
  title,
  body,
  onConfirm,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

  // Use the translations from i18n with fallbacks
  const confirm = confirmText || t("alertModal.confirm", "확인");
  const cancel = cancelText || t("alertModal.cancel", "취소");

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {cancel}
        </Button>
        {onConfirm && (
          <Button variant="primary" onClick={onConfirm}>
            {confirm}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;
