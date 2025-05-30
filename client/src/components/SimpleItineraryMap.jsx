// import React, { useEffect, useRef } from 'react';

// const SimpleItineraryMap = ({ daySpots, date }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
  
//   useEffect(() => {
//     if (!window.L || !daySpots || daySpots.length === 0) return;
    
//     // 이미 지도가 초기화되어 있으면 제거
//     if (mapInstance.current) {
//       mapInstance.current.remove();
//     }
    
//     // 지도 생성
//     const center = [parseFloat(daySpots[0].lat), parseFloat(daySpots[0].lng)];
//     mapInstance.current = window.L.map(mapRef.current).setView(center, 13);
    
//     // 지도 타일 추가
//     window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(mapInstance.current);
    
//     // 마커 추가
//     const markers = [];
//     const bounds = window.L.latLngBounds();
    
//     daySpots.forEach((spot, index) => {
//       const lat = parseFloat(spot.lat);
//       const lng = parseFloat(spot.lng);
//       const marker = window.L.marker([lat, lng])
//         .addTo(mapInstance.current)
//         .bindPopup(`<b>${index + 1}. ${spot.spot}</b><br>${spot.city} ${spot.district || ''}`);
      
//       markers.push(marker);
//       bounds.extend([lat, lng]);
//     });
    
//     // 모든 마커가 보이도록 지도 범위 조정
//     if (daySpots.length > 1) {
//       mapInstance.current.fitBounds(bounds, {
//         padding: [50, 50],
//         maxZoom: 15
//       });
//     }
    
//     // 경로 그리기 (단순 직선)
//     if (daySpots.length > 1) {
//       const pathCoordinates = daySpots.map(spot => [
//         parseFloat(spot.lat), 
//         parseFloat(spot.lng)
//       ]);
      
//       window.L.polyline(pathCoordinates, {
//         color: '#3388ff',
//         weight: 4,
//         opacity: 0.7,
//         dashArray: '10, 10',
//         lineJoin: 'round'
//       }).addTo(mapInstance.current);
//     }
    
//     // 컴포넌트 언마운트 시 지도 제거
//     return () => {
//       if (mapInstance.current) {
//         mapInstance.current.remove();
//       }
//     };
//   }, [daySpots]);
  
//   return (
//     <div className="simple-map-container">
//       {/* <h3 className="map-title">{date}</h3> */}
//       <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '8px' }}></div>
//     </div>
//   );
// };

// export default SimpleItineraryMap;