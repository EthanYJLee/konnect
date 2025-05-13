import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Badge from "../components/Badge";
import { useTheme } from "../contexts/ThemeContext";
import StringToColor from "../utils/StringToColor";
import axios from "axios";

const CategoryBadgeModal = ({ show, onClose, pair, onCategoryUpdate }) => {
  const token = localStorage.getItem("token");

  //   useEffect(() => {
  //     console.log(pair.category);
  //   }, []);
  const { theme, toggleTheme } = useTheme();
  const defaultCategories = [
    "travel",
    "transportation",
    "food",
    "communication",
    "hospital",
    "accommodation",
    "shopping",
    "culture",
    "language",
    "daily life",
  ];
  // 카테고리 변경 관리
  const [selectedCategory, setSelectedCategory] = useState(
    pair?.category || ""
  );
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
  };

  const handleUpdate = async () => {
    console.log(selectedCategory);
    console.log(pair._id);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_WAS_URL}/api/history/updateCategory`,
        { id: pair._id, cat: selectedCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      //   if (response) {
      //     console.log(response);
      //     onClose();
      //   }
      if (onCategoryUpdate) {
        onCategoryUpdate(pair._id, selectedCategory);
      }
      onClose();
    } catch (error) {
      console.error("변경 실패:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header
        className={`modal-header ${theme}`}
        style={{ border: "none" }}
        closeButton
      >
        {/* <Modal.Title>저장</Modal.Title> */}
      </Modal.Header>

      <Modal.Body>
        <div>
          <div className="badge-container">
            {defaultCategories.map((cat) =>
              selectedCategory === cat ? (
                <button
                  className={`custom-badge custom-badge-lg badge-modal-${cat}`}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    backgroundColor: StringToColor(cat),
                    margin: "0.4rem 0.5rem",
                    border: "2px solid white",
                  }}
                >
                  {cat}
                </button>
              ) : (
                <button
                  className={`custom-badge custom-badge-lg badge-modal-${cat}`}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    backgroundColor: StringToColor(cat),
                    margin: "0.4rem 0.5rem",
                  }}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="category-badge-modal-btn" onClick={handleUpdate}>
          수정
        </button>
      </Modal.Footer>
    </Modal>
  );
};
export default CategoryBadgeModal;
