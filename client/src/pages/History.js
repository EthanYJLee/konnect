import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import HistoryCard from "../components/HistoryCard";
import "../styles/History.scss";
import { Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSortAmountDown,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

const History = () => {
  const { t } = useTranslation();
  const [pairs, setPairs] = useState([]);
  const [filteredPairs, setFilteredPairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // 검색어나 카테고리가 변경될 때 필터링
    filterPairs();
  }, [searchTerm, selectedCategory, pairs]);

  // 히스토리 데이터 가져오기
  const fetchHistory = async () => {
    try {
      const url = process.env.REACT_APP_WAS_URL;
      const response = await axios.get(`${url}/api/history/fetchHistory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = response.data.sort((a, b) => b.pairOrder - a.pairOrder);
      setPairs(sorted);

      // 카테고리 목록 추출
      const uniqueCategories = [
        ...new Set(sorted.map((pair) => pair.category || "기타")),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    }
  };

  // 검색어와 카테고리로 필터링
  const filterPairs = () => {
    let filtered = [...pairs];

    if (searchTerm) {
      filtered = filtered.filter(
        (pair) =>
          pair.userMessage.content
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pair.aiMessage.content
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (pair) => (pair.category || "기타") === selectedCategory
      );
    }

    setFilteredPairs(filtered);
  };

  // 드래그 앤 드롭 후 순서 변경
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(filteredPairs);
    const [moved] = items.splice(source.index, 1);
    items.splice(destination.index, 0, moved);

    // 필터링된 목록 업데이트
    setFilteredPairs(items);

    // 전체 목록에서도 해당 항목 위치 변경
    const originalIndex = pairs.findIndex((p) => p._id === moved._id);
    const newItems = Array.from(pairs);
    newItems.splice(originalIndex, 1);
    const newDestIndex = getNewDestinationIndex(destination.index, moved._id);
    newItems.splice(newDestIndex, 0, moved);

    // order 업데이트
    const updated = newItems.map((pair, idx) => ({
      ...pair,
      pairOrder: idx,
    }));

    setPairs(updated);
    await saveOrderToServer(updated);
  };

  // 새 위치 인덱스 계산 함수
  const getNewDestinationIndex = (displayIndex, movedId) => {
    // 필터링된 아이템 중 displayIndex 위치의 아이템을 전체 배열에서 찾기
    const displayedItems = filteredPairs.filter((_, i) => i <= displayIndex);
    const lastDisplayedId = displayedItems[displayedItems.length - 1]?._id;

    if (!lastDisplayedId || lastDisplayedId === movedId) {
      // 첫 번째 위치로 이동하는 경우
      return 0;
    }

    // 전체 아이템 목록에서 해당 ID의 위치 찾기
    const originalIndex = pairs.findIndex((p) => p._id === lastDisplayedId);
    return originalIndex + 1;
  };

  const saveOrderToServer = async (orderedPairs) => {
    try {
      const url = process.env.REACT_APP_WAS_URL;
      await axios.post(
        `${url}/api/history/updateOrder`,
        {
          orderedPairs: orderedPairs.map(({ _id, pairOrder }) => ({
            _id,
            pairOrder,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("순서 저장 실패:", error);
    }
  };

  const handleCategoryUpdate = (pairId, newCategory) => {
    const updated = pairs.map((pair) =>
      pair._id === pairId ? { ...pair, category: newCategory } : pair
    );
    setPairs(updated);

    // 카테고리 목록 업데이트
    const uniqueCategories = [
      ...new Set(updated.map((pair) => pair.category || "기타")),
    ];
    setCategories(uniqueCategories);
  };

  return (
    <div className="history-container">
      <Container>
        <div className="page-header">
          <h1>{t("history.title")}</h1>
          <p>{t("history.subtitle")}</p>

          <div className="history-filters">
            <div className="search-box">
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </InputGroup.Text>
                <Form.Control
                  placeholder={t("history.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>

            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">{t("history.allCategories")}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="history-droppable"
            direction="horizontal"
            type="CARD"
          >
            {(provided, snapshot) => (
              <Row
                xs={1}
                md={2}
                lg={3}
                className="g-4 align-items-stretch"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredPairs.map((pair, index) => (
                  <Draggable
                    key={pair._id || `pair-${index}`}
                    draggableId={(pair._id || `pair-${index}`).toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Col
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "dragging-item" : ""}
                      >
                        <div
                          className={snapshot.isDragging ? "dragging-card" : ""}
                        >
                          <HistoryCard
                            pair={pair}
                            onCategoryUpdate={handleCategoryUpdate}
                          />
                        </div>
                      </Col>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Row>
            )}
          </Droppable>
        </DragDropContext>
      </Container>
    </div>
  );
};

export default History;
