// client/src/contexts/RateLimitContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const RateLimitContext = createContext();

// 로컬 스토리지에서 요청 상태 가져오기
const getStoredRequestState = (key) => {
  try {
    const storedState = localStorage.getItem(`rateLimit_${key}`);
    if (storedState) {
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error(`Error retrieving rate limit data for ${key}:`, error);
  }
  return { count: 0, lastReset: Date.now() };
};

// 로컬 스토리지에 요청 상태 저장
const storeRequestState = (key, state) => {
  try {
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(state));
  } catch (error) {
    console.error(`Error storing rate limit data for ${key}:`, error);
  }
};

export const RateLimitProvider = ({ children }) => {
  // 채팅 제한
  const [chatRequests, setChatRequests] = useState(
    getStoredRequestState("chat")
  );

  // 큐레이션 검색 제한
  const [searchRequests, setSearchRequests] = useState(
    getStoredRequestState("search")
  );

  // 일정 생성 제한
  const [itineraryRequests, setItineraryRequests] = useState(
    getStoredRequestState("itinerary")
  );

  // 시간당 제한 설정
  const LIMITS = {
    chat: 20, // 시간당 20회
    search: 20, // 시간당 20회
    itinerary: 5, // 시간당 5회
  };

  // 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    storeRequestState("chat", chatRequests);
  }, [chatRequests]);

  useEffect(() => {
    storeRequestState("search", searchRequests);
  }, [searchRequests]);

  useEffect(() => {
    storeRequestState("itinerary", itineraryRequests);
  }, [itineraryRequests]);

  // 1시간마다 카운트 리셋
  useEffect(() => {
    const resetInterval = setInterval(() => {
      const now = Date.now();

      // 마지막 리셋으로부터 1시간 이상 지났으면 리셋
      if (now - chatRequests.lastReset >= 3600000) {
        setChatRequests({ count: 0, lastReset: now });
      }

      if (now - searchRequests.lastReset >= 3600000) {
        setSearchRequests({ count: 0, lastReset: now });
      }

      if (now - itineraryRequests.lastReset >= 3600000) {
        setItineraryRequests({ count: 0, lastReset: now });
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(resetInterval);
  }, [
    chatRequests.lastReset,
    searchRequests.lastReset,
    itineraryRequests.lastReset,
  ]);

  // 요청 추가 및 제한 확인 함수
  const checkChatLimit = () => {
    if (chatRequests.count >= LIMITS.chat) {
      return false; // 제한 초과
    }
    setChatRequests({
      ...chatRequests,
      count: chatRequests.count + 1,
    });
    return true; // 요청 가능
  };

  const checkSearchLimit = () => {
    if (searchRequests.count >= LIMITS.search) {
      return false;
    }
    setSearchRequests({
      ...searchRequests,
      count: searchRequests.count + 1,
    });
    return true;
  };

  const checkItineraryLimit = () => {
    if (itineraryRequests.count >= LIMITS.itinerary) {
      return false;
    }
    setItineraryRequests({
      ...itineraryRequests,
      count: itineraryRequests.count + 1,
    });
    return true;
  };

  // 남은 요청 수 확인
  const getRemainingRequests = (type) => {
    switch (type) {
      case "chat":
        return LIMITS.chat - chatRequests.count;
      case "search":
        return LIMITS.search - searchRequests.count;
      case "itinerary":
        return LIMITS.itinerary - itineraryRequests.count;
      default:
        return 0;
    }
  };

  // 리셋까지 남은 시간 (분)
  const getTimeToReset = (type) => {
    const now = Date.now();
    let lastReset;

    switch (type) {
      case "chat":
        lastReset = chatRequests.lastReset;
        break;
      case "search":
        lastReset = searchRequests.lastReset;
        break;
      case "itinerary":
        lastReset = itineraryRequests.lastReset;
        break;
      default:
        return 0;
    }

    const elapsed = now - lastReset;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 60000));
    return remaining;
  };

  return (
    <RateLimitContext.Provider
      value={{
        checkChatLimit,
        checkSearchLimit,
        checkItineraryLimit,
        getRemainingRequests,
        getTimeToReset,
      }}
    >
      {children}
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = () => useContext(RateLimitContext);
