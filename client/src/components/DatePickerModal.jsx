import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/SavePairModal.scss";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/HistoryModal.scss";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerModal = ({ show, onClose, selectedDate, onChange }) => {
  const { theme, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");
  const threadId = localStorage.getItem("assistant_thread");

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header
        className={`modal-header ${theme}`}
        style={{ border: "none" }}
        closeButton
      >
        {/* <Modal.Title>저장</Modal.Title> */}
      </Modal.Header>

      <Modal.Body className="history-modal-body">
        <div>
          <div style={{ textAlign: "center" }}>
            <DatePicker selected={selectedDate} onChange={onChange} inline />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DatePickerModal;
