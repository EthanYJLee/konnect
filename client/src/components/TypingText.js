import React, { useEffect, useRef, useState } from "react";

const TypingText = ({ text = "", speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState(""); // 현재까지 출력된 텍스트 상태
  const indexRef = useRef(0); // 현재 출력할 글자의 인덱스를 추적
  const intervalRef = useRef(null); // setInterval ID를 저장 (정리용)

  useEffect(() => {
    if (!text || typeof text !== "string") return; // 잘못된 텍스트일 경우 종료

    setDisplayedText(""); // 새 텍스트 입력 시 기존 텍스트 초기화
    indexRef.current = 0; // 인덱스 처음부터 시작

    // setInterval로 글자 하나씩 출력
    intervalRef.current = setInterval(() => {
      indexRef.current += 1;

      const currentText = text.slice(0, indexRef.current); // 현재 인덱스까지 자름
      setDisplayedText(currentText); // 상태 업데이트로 화면에 출력

      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current); // 모든 글자 출력되면 인터벌 정지
      }
    }, speed); // 지정된 속도로 글자 출력

    return () => clearInterval(intervalRef.current); // 컴포넌트 언마운트 시 인터벌 제거
  }, [text, speed]); // text 또는 속도 바뀌면 다시 실행

  return <h1>{displayedText}</h1>; // 출력 결과 반환
};

export default TypingText;
