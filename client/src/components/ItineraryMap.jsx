import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

const ItineraryMap = ({ daySpots, date }) => {
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
        
        // OSRM API 호출 (예: 도보 경로)
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
    <div className="itinerary-map-container">
      <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* 각 장소 마커 표시 */}
        {daySpots.map((spot, index) => (
          <Marker 
            key={`marker-${index}`} 
            position={[parseFloat(spot.lat), parseFloat(spot.lng)]}
          >
            <Popup>
              <div>
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
            color="blue" 
            weight={3} 
            opacity={0.7} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default ItineraryMap;