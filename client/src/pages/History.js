import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import HistoryCard from "../components/HistoryCard";
import "../styles/History.scss";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Nav,
  Card,
  Button,
  Table,
} from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSortAmountDown,
  faCalendarAlt,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import HistoryItineraryModal from "../components/HistoryItineraryModal";

const History = () => {
  const { t } = useTranslation();
  const [pairs, setPairs] = useState([]);
  const [filteredPairs, setFilteredPairs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const token = localStorage.getItem("token");

  // Debug logs
  useEffect(() => {
    console.log("History component initialized");
    console.log("Token exists:", !!token);
    console.log(
      "REACT_APP_WAS_URL:",
      process.env.REACT_APP_WAS_URL || "Using fallback: http://localhost:4000"
    );
  }, [token]);

  // 탭 관련 상태
  const [activeTab, setActiveTab] = useState("conversations");

  // 일정 관련 상태
  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  useEffect(() => {
    if (activeTab === "conversations") {
      fetchPairs();
    } else if (activeTab === "itineraries") {
      fetchItineraries();
    }
  }, [activeTab]);

  // 탭이 itineraries일 때 렌더링될 때마다 데이터 최신 상태 유지
  useEffect(() => {
    if (activeTab === "itineraries") {
      console.log("Refreshing itineraries data");
      fetchItineraries();
    }
  }, [activeTab]);

  useEffect(() => {
    // 검색어나 카테고리가 변경될 때 필터링
    if (activeTab === "conversations") {
      filterPairs();
    } else if (activeTab === "itineraries") {
      filterItineraries();
    }
  }, [selectedCategory, pairs, itineraries, activeTab]);

  // 히스토리 데이터 가져오기
  const fetchPairs = async () => {
    try {
      const url = process.env.REACT_APP_WAS_URL || "http://localhost:4000";
      console.log("Fetching pairs with URL:", url);
      console.log("Using token:", token ? "Token exists" : "No token");

      const response = await axios.get(`${url}/api/history/fetchPairs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Pairs response:", response.data);
      const sorted = response.data.sort((a, b) => b.pairOrder - a.pairOrder);
      setPairs(sorted);

      // 카테고리 목록 추출
      const uniqueCategories = [
        ...new Set(sorted.map((pair) => pair.category || "기타")),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
    }
  };

  // 저장된 일정 가져오기
  const fetchItineraries = async () => {
    try {
      const url = process.env.REACT_APP_WAS_URL;
      console.log("Fetching itineraries with URL:", url);
      console.log("Using token:", token ? "Token exists" : "No token");

      // 서버에서 활성화된 일정만 가져오기
      const response = await axios.get(`${url}/api/history/fetchItineraries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Itineraries response:", response.data);

      if (Array.isArray(response.data)) {
        // 활성화된 일정만 필터링 (서버에서 이미 필터링되었지만 안전하게 한번 더)
        const activeItineraries = response.data.filter(
          (itinerary) => itinerary.useYn !== false
        );

        // 날짜 기준 내림차순 정렬
        const sorted = activeItineraries.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setItineraries(sorted);
        setFilteredItineraries(sorted);

        console.log(`Loaded ${sorted.length} active itineraries`);
      } else {
        console.error("Invalid response format:", response.data);
        setItineraries([]);
        setFilteredItineraries([]);
      }
    } catch (error) {
      console.error("일정 데이터 가져오기 실패:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }

      // 오류 발생 시 빈 배열로 설정
      setItineraries([]);
      setFilteredItineraries([]);
    }
  };

  // 검색어와 카테고리로 필터링
  const filterPairs = () => {
    let filtered = [...pairs];

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (pair) => (pair.category || "기타") === selectedCategory
      );
    }

    setFilteredPairs(filtered);
  };

  // 일정 필터링 - 검색 없음
  const filterItineraries = () => {
    // useYn이 false가 아닌 itinerary만 필터링
    const activeItineraries = itineraries.filter(
      (itinerary) => itinerary.useYn !== false
    );
    setFilteredItineraries(activeItineraries);
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
      const url = process.env.REACT_APP_WAS_URL || "http://localhost:4000";
      console.log("Saving order with URL:", url);

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
      console.error("순서 저장 실패:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
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

  // 일정 보기 버튼 클릭 핸들러
  const handleViewItinerary = (itinerary) => {
    try {
      // 일정 데이터 구조 확인
      if (!itinerary || !itinerary.itinerary) {
        console.error("Invalid itinerary data:", itinerary);
        alert(
          t("curation.itineraryError", "일정 데이터를 불러올 수 없습니다.")
        );
        return;
      }

      // 문자열로 저장된 JSON 객체인지 확인
      let itineraryData = itinerary.itinerary;
      if (typeof itineraryData === "string") {
        try {
          itineraryData = JSON.parse(itineraryData);
        } catch (parseError) {
          console.error("Error parsing itinerary string:", parseError);
          alert(
            t("curation.itineraryError", "일정 데이터를 불러올 수 없습니다.")
          );
          return;
        }
      }

      // 객체가 아니거나 빈 객체인 경우 처리
      if (
        typeof itineraryData !== "object" ||
        itineraryData === null ||
        Object.keys(itineraryData).length === 0
      ) {
        console.error("Itinerary is not a valid object:", itineraryData);
        alert(
          t("curation.itineraryError", "일정 데이터를 불러올 수 없습니다.")
        );
        return;
      }

      // 먼저 데이터 설정 후 모달 표시
      setSelectedItinerary(itineraryData);
      setShowItineraryModal(true);
    } catch (error) {
      console.error("Error processing itinerary data:", error);
      alert(t("curation.itineraryError", "일정 데이터를 불러올 수 없습니다."));
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteItinerary = async (itineraryId) => {
    if (
      window.confirm(
        t(
          "alertModal.confirmDeleteItinerary",
          "Are you sure you want to delete this itinerary?"
        )
      )
    ) {
      try {
        const url = process.env.REACT_APP_WAS_URL;
        console.log("Deleting itinerary with URL:", url);

        const response = await axios.post(
          `${url}/api/history/deleteItinerary/${itineraryId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // 삭제 후 서버에서 데이터 다시 가져오기
        fetchItineraries();
      } catch (error) {
        console.error("일정 삭제 실패:", error.message);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
      }
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 여행 일정 날짜 포맷 함수
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="history-container">
      <Container>
        <div className="page-header">
          <h1>{t("history.title")}</h1>

          {/* 탭 네비게이션 */}
          <Nav
            variant="tabs"
            className="history-tabs"
            activeKey={activeTab}
            onSelect={setActiveTab}
          >
            <Nav.Item>
              <Nav.Link eventKey="conversations">
                {t("history.conversations")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="itineraries">
                {t("history.itineraries")}
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === "conversations" && (
            <div className="history-filters">
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
          )}
        </div>

        {/* 대화 내용 탭 */}
        {activeTab === "conversations" && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="history-droppable"
              direction="horizontal"
              type="CARD"
            >
              {(provided, snapshot) => (
                <Row
                  className="history-items-grid g-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filteredPairs.length > 0 ? (
                    filteredPairs.map((pair, index) => (
                      <Draggable
                        key={pair._id || `pair-${index}`}
                        draggableId={(pair._id || `pair-${index}`).toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Col
                            xs={12}
                            md={6}
                            lg={4}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              snapshot.isDragging ? "dragging-item" : ""
                            }
                          >
                            <div
                              className={`history-card-wrapper ${
                                snapshot.isDragging ? "dragging-card" : ""
                              }`}
                            >
                              <HistoryCard
                                pair={pair}
                                onCategoryUpdate={handleCategoryUpdate}
                              />
                            </div>
                          </Col>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <Col xs={12} className="text-center py-5">
                      <p className="empty-message">{t("history.empty")}</p>
                    </Col>
                  )}
                  {provided.placeholder}
                </Row>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* 여행 일정 탭 */}
        {activeTab === "itineraries" && (
          <div className="itinerary-table-container">
            <Table striped hover responsive className="itinerary-table">
              <thead>
                <tr>
                  <th>{t("history.date", "Date")}</th>
                  <th>{t("history.spots", "Spots")}</th>
                  <th>{t("history.regions", "Regions")}</th>
                  <th className="text-center">
                    {t("history.actions", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItineraries.length > 0 ? (
                  filteredItineraries.map((itinerary) => {
                    // 지역 정보 추출
                    const regions = new Set();
                    let spotCount = 0;

                    if (typeof itinerary.itinerary === "object") {
                      // 각 날짜별 스팟 개수 합산
                      Object.keys(itinerary.itinerary).forEach((date) => {
                        const spotsForDay = itinerary.itinerary[date];
                        if (Array.isArray(spotsForDay)) {
                          spotCount += spotsForDay.length;

                          // 도시/지역 정보 수집
                          spotsForDay.forEach((spot) => {
                            if (spot && spot.city) {
                              regions.add(spot.city);
                            }
                          });
                        }
                      });
                    }

                    return (
                      <tr key={itinerary._id}>
                        <td>{formatDate(itinerary.createdAt)}</td>
                        <td>{spotCount}</td>
                        <td>{Array.from(regions).join(", ") || "-"}</td>
                        <td className="text-center action-buttons">
                          <Button
                            variant="primary"
                            className="view-btn me-2"
                            onClick={() => handleViewItinerary(itinerary)}
                          >
                            <FontAwesomeIcon icon={faEye} className="me-1" />
                            {t("history.view", "View")}
                          </Button>
                          <Button
                            variant="outline-danger"
                            className="delete-btn"
                            onClick={() => handleDeleteItinerary(itinerary._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            {t("history.delete", "Delete")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <p className="empty-message">
                        {t("history.noItineraries")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* 일정 상세 모달 */}
        {selectedItinerary && showItineraryModal && (
          <HistoryItineraryModal
            isOpen={true}
            onClose={() => {
              setShowItineraryModal(false);
              setTimeout(() => {
                setSelectedItinerary(null);
              }, 300);
            }}
            itinerary={selectedItinerary}
            formatDisplayDate={formatDisplayDate}
          />
        )}
      </Container>
    </div>
  );
};

export default History;
