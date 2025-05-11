import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import HistoryCard from "../components/HistoryCard";
import "../styles/History.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import HistoryModal from "../components/HistoryModal";

const History = () => {
  const { t } = useTranslation();
  const [pairs, setPairs] = useState([]);
  const token = localStorage.getItem("token");

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPair(null);
  };

  const handleShowModal = (pair) => {
    setSelectedPair(pair);
    setShowModal(true);
  };

  const [selectedPair, setSelectedPair] = useState(null); // 추가

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const url = process.env.REACT_APP_WAS_URL;
      const response = await axios.get(`${url}/api/history/fetchHistory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = response.data.sort((a, b) => a.pairOrder - b.pairOrder);
      setPairs(sorted);
    } catch (error) {
      console.error("실패:", error);
    }
  };

  // reordered 배열을 재정렬하면서 order 필드 재설정
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reordered = Array.from(pairs);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    // order 업데이트
    const updated = reordered.map((pair, idx) => ({
      ...pair,
      pairOrder: idx,
    }));

    setPairs(updated);
    await saveOrderToServer(updated);
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

  return (
    <div className="history-container">
      <Container>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="history-droppable"
            direction="horizontal"
            isDropDisabled={false} // 드롭 가능한지
            isCombineEnabled={false} // 덮어쓰기 가능한지
            ignoreContainerClipping={false} // 클리핑 영향을 무시하고 더 넓은 영역을 드롭 대상으로 만들 수 있는지
          >
            {(provided) => (
              <Row
                xs={1}
                md={2}
                lg={3}
                className="g-4 align-items-stretch"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {pairs.map((pair, index) => (
                  <Draggable
                    key={pair._id || `pair-${index}`}
                    draggableId={(pair._id || `pair-${index}`).toString()}
                    index={index}
                  >
                    {(provided) => (
                      <Col
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card
                          onClick={() => handleShowModal(pair)}
                          style={{
                            backgroundColor: "transparent",
                            // border: "none",
                            borderRadius: "12px",
                          }}
                        >
                          <HistoryCard
                            userMessage={pair.userMessage}
                            aiMessage={pair.aiMessage}
                            createdAt={pair.createdAt}
                          />
                        </Card>
                      </Col>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Row>
            )}
          </Droppable>
        </DragDropContext>
        {selectedPair && (
          <HistoryModal
            show={showModal}
            onClose={handleCloseModal}
            userMessage={selectedPair.userMessage}
            aiMessage={selectedPair.aiMessage}
            createdAt={selectedPair.createdAt}
          />
        )}
      </Container>
    </div>
  );
};

export default History;
