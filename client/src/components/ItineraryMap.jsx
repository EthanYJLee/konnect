import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Leaflet의 마커 아이콘 문제 해결
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 맵 로드 이벤트 처리 컴포넌트
const MapInitializer = ({ onMapLoaded }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      // 맵이 로드되면 콜백 실행
      map.once('load', () => {
        if (onMapLoaded) onMapLoaded();
      });
      
      // 맵이 이미 로드된 경우를 위한 타임아웃
      const timer = setTimeout(() => {
        if (onMapLoaded) onMapLoaded();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [map, onMapLoaded]);
  
  return null;
};

// 커스텀 마커 아이콘 생성 함수
const createCustomIcon = (index) => {
  // 기본 색상 설정
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#5B9BD5', '#3F51B5'];
  const color = colors[index % colors.length];
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const ItineraryMap = ({ daySpots, date, onMapLoaded }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!daySpots || daySpots.length < 2) {
        setLoading(false);
        return;
      }
      
      try {
        // 모든 장소의 좌표 추출
        const coordinates = daySpots.map(spot => [parseFloat(spot.lng), parseFloat(spot.lat)]);
        
        // OSRM API 호출
        const osrmUrl = `https://router.project-osrm.org/route/v1/walking/${coordinates.map(coord => coord.join(',')).join(';')}?overview=full&geometries=geojson`;
        
        const response = await axios.get(osrmUrl);
        
        if (response.data.routes && response.data.routes.length > 0) {
          // GeoJSON 형식의 경로 받기
          const routeCoordinates = response.data.routes[0].geometry.coordinates;
          // Leaflet에서 사용하는 [lat, lng] 형식으로 변환
          const leafletCoordinates = routeCoordinates.map(coord => [coord[1], coord[0]]);
          setRoutes(leafletCoordinates);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, [daySpots]);
  
  // 지도의 중심점 계산
  const center = daySpots && daySpots.length > 0
    ? [parseFloat(daySpots[0].lat), parseFloat(daySpots[0].lng)]
    : [37.5665, 126.9780]; // 서울 기본 좌표
  
  if (loading) {
    return <div className="map-loading">Loading map...</div>;
  }
  
  return (
    <div className="itinerary-map-container" style={{alignItems: 'center', justifyContent: 'center'}}>
      <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
        <MapInitializer onMapLoaded={onMapLoaded} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* 각 장소 마커 표시 */}
        {daySpots.map((spot, index) => (
          <Marker 
            key={`marker-${index}`} 
            position={[parseFloat(spot.lat), parseFloat(spot.lng)]}
            icon={createCustomIcon(index)}
          >
            <Popup>
              <div className="spot-popup">
                <strong>{index + 1}. {spot.spot}</strong>
                <div>{spot.city} {spot.district || ''} {spot.neighborhood || ''}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* 경로 표시 */}
        {routes.length > 0 && (
          <Polyline 
            positions={routes} 
            color="#4285F4" 
            weight={4} 
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default ItineraryMap;