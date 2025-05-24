from dotenv import load_dotenv, find_dotenv
import os
from sklearn.cluster import KMeans
from datetime import datetime, timedelta
import numpy as np
from geopy.distance import geodesic
import requests
import random
import os
from dotenv import load_dotenv, find_dotenv
import json


# 환경 변수 로드
load_dotenv(find_dotenv())
DATA_SERVICE_KEY = os.getenv("DATA_SERVICE_KEY")


def normalize_region_name(region_name):
    """
    지역명을 표준화된 형식으로 변환 (영문/한글 통일 및 접미사 제거)
    """
    # 소문자로 변환
    region = region_name.lower() if isinstance(region_name, str) else ""

    # 영문-한글 매핑 테이블
    region_mapping = {
        'seoul': '서울',
        'busan': '부산',
        'daegu': '대구',
        'incheon': '인천',
        'gwangju': '광주',
        'daejeon': '대전',
        'ulsan': '울산',
        'sejong': '세종',
        'gyeonggi': '경기',
        'gangwon': '강원',
        'chungbuk': '충북',
        'chungnam': '충남',
        'jeonbuk': '전북',
        'jeonnam': '전남',
        'gyeongbuk': '경북',
        'gyeongnam': '경남',
        'jeju': '제주'
    }

    # 한글-영문 매핑도 추가
    korean_to_english = {v: k for k, v in region_mapping.items()}

    # 접미사 제거 정규식
    suffixes = ['시', '도', '군', '구', '특별시', '광역시', '특별자치시', '특별자치도']

    # 영문이면 한글로 변환
    if region in region_mapping:
        return region_mapping[region]

    # 한글 지역명에서 접미사 제거
    for suffix in suffixes:
        if region.endswith(suffix):
            region = region[:-len(suffix)]

    # 기본 행정구역 이름만 추출 (첫 단어)
    if ' ' in region:
        region = region.split()[0]

    # 한글 기본명에 대해 매핑된 표준 이름 찾기
    for key, value in region_mapping.items():
        if value in region or region in value:
            return value

    for key, value in korean_to_english.items():
        if key in region or region in key:
            return key

    return region


def extract_and_organize_regions(info, departure_city, arrival_city):
    """
    사용자 입력 장소와 출발/도착 도시에서 지역 정보를 추출하고 정리
    중복 제거 및 효율적인 이동 경로 생성
    출발지/도착지가 사용자 선택 장소와 다른 지역이어도 경로에 포함
    """
    # 출발/도착 도시 정규화
    normalized_departure = normalize_region_name(departure_city)
    normalized_arrival = normalize_region_name(arrival_city)

    # 모든 장소의 지역 정보 추출 및 정규화
    regions_data = []
    user_regions = set()

    # 사용자 입력 장소에서 지역 추출
    for spot in info:
        if "city" in spot and spot["city"]:
            normalized_region = normalize_region_name(spot["city"])
            user_regions.add(normalized_region)
            
            # 이미 추가된 지역인지 확인
            if not any(r['name'] == normalized_region for r in regions_data):
                regions_data.append({
                    'name': normalized_region,
                    'lat': float(spot.get("lat", 0)),
                    'lng': float(spot.get("lng", 0)),
                    'is_departure': normalized_region == normalized_departure,
                    'is_arrival': normalized_region == normalized_arrival
                })
    
    # 출발 도시가 사용자 지역에 없다면 추가
    if normalized_departure not in user_regions:
        regions_data.insert(0, {
            'name': normalized_departure,
            'lat': get_region_center(normalized_departure)[0],
            'lng': get_region_center(normalized_departure)[1],
            'is_departure': True,
            'is_arrival': normalized_departure == normalized_arrival
        })
    
    # 도착 도시가 사용자 지역에 없고, 출발 도시와 다르다면 추가
    if normalized_arrival not in user_regions and normalized_arrival != normalized_departure:
        regions_data.append({
            'name': normalized_arrival,
            'lat': get_region_center(normalized_arrival)[0],
            'lng': get_region_center(normalized_arrival)[1],
            'is_departure': False,
            'is_arrival': True
        })
    
    # 출발지와 도착지가 같을 경우 처리
    if normalized_departure == normalized_arrival:
        for r in regions_data:
            if r['name'] == normalized_departure:
                r['is_arrival'] = True
                break
    
    # 경로에 출발지와 도착지가 포함되었는지 확인
    has_departure = any(r['is_departure'] for r in regions_data)
    has_arrival = any(r['is_arrival'] for r in regions_data)
    
    if not has_departure or not has_arrival:
        print(f"Warning: 출발 또는 도착 지역 정보를 찾을 수 없습니다. 기본값으로 설정합니다.")
        return [normalized_departure] + list(user_regions) + [normalized_arrival]
    
    # 출발지-도착지 사이 효율적인 경로 계산
    # 출발지와 도착지는 고정, 중간 지역들은 TSP로 최적화
    try:
        start_region = next(r for r in regions_data if r['is_departure'])
        end_region = next(r for r in regions_data if r['is_arrival'])
    except StopIteration:
        # StopIteration 오류 방지를 위한 안전장치
        print(f"Warning: 출발 또는 도착 지역을 찾을 수 없어 기본값으로 설정합니다.")
        return [normalized_departure] + list(user_regions) + [normalized_arrival]

    # 중간 지역들 (출발지, 도착지 제외)
    middle_regions = [r for r in regions_data if not (r['is_departure'] or r['is_arrival'])]

    # 중간 지역이 있는 경우 TSP로 최적 경로 계산
    if middle_regions:
        # 거리 행렬 계산
        n = len(middle_regions)
        distance_matrix = np.zeros((n, n))

        for i in range(n):
            for j in range(n):
                if i != j:
                    coord1 = (middle_regions[i]['lat'], middle_regions[i]['lng'])
                    coord2 = (middle_regions[j]['lat'], middle_regions[j]['lng'])
                    distance_matrix[i][j] = geodesic(coord1, coord2).km

        # 출발지와 도착지를 고려한 경로 최적화
        # 각 중간 지역의 출발지/도착지로부터의 거리 계산
        start_distances = []
        end_distances = []

        for region in middle_regions:
            start_coord = (start_region['lat'], start_region['lng'])
            end_coord = (end_region['lat'], end_region['lng'])
            region_coord = (region['lat'], region['lng'])

            start_distances.append(geodesic(start_coord, region_coord).km)
            end_distances.append(geodesic(end_coord, region_coord).km)

        # 가장 가까운 지점부터 시작하여 경로 생성
        current = np.argmin(start_distances)
        path = [current]
        unvisited = set(range(n))
        unvisited.remove(current)

        while unvisited:
            if len(unvisited) == 1:
                # 마지막 하나는 도착지와 가장 가까운 것으로 선택
                last = list(unvisited)[0]
                path.append(last)
                unvisited.remove(last)
            else:
                next_region = min(unvisited, key=lambda x: distance_matrix[current][x])
                path.append(next_region)
                unvisited.remove(next_region)
                current = next_region

        # 최종 경로 생성 (출발지 -> 중간 지역들 -> 도착지)
        ordered_regions = [start_region['name']]
        for p in path:
            ordered_regions.append(middle_regions[p]['name'])
        ordered_regions.append(end_region['name'])
    else:
        # 중간 지역이 없으면 출발지->도착지 직행
        ordered_regions = [start_region['name'], end_region['name']]

    # 중복 제거 (마지막 발견된 항목만 유지)
    unique_regions = []
    for region in ordered_regions:
        if region in unique_regions:
            unique_regions.remove(region)
        unique_regions.append(region)

    return unique_regions


def allocate_days_to_regions(regions, total_days):
    """
    총 일수를 지역별로 균등하게 분배
    """
    n_regions = len(regions)

    # 기본 할당 (균등 분배)
    base_days = total_days // n_regions
    extra_days = total_days % n_regions

    region_days = {}

    # 기본 일수 할당
    for region in regions:
        region_days[region] = base_days

    # 남은 일수 분배 (앞쪽 지역부터 하루씩 추가)
    for i in range(extra_days):
        region_days[regions[i]] += 1

    return region_days


def map_regions_to_dates(region_days, date_list):
    """
    지역별 할당된 일수를 실제 날짜에 매핑
    """
    region_dates = {}
    date_index = 0

    for region, days in region_days.items():
        region_dates[region] = []
        for _ in range(days):
            if date_index < len(date_list):
                region_dates[region].append(date_list[date_index])
                date_index += 1

    return region_dates


def map_user_spots_to_normalized_regions(user_spots, region_mapping):
    """
    사용자 입력 장소의 지역명을 정규화하여 매핑
    """
    normalized_spots = []

    for spot in user_spots:
        spot_copy = spot.copy()  # 원본 데이터 유지를 위한 복사

        if "city" in spot_copy and spot_copy["city"]:
            original_city = spot_copy["city"]
            normalized_city = normalize_region_name(original_city)

            # 정규화된 지역명으로 매핑
            for region in region_mapping.keys():
                if region == normalized_city or normalized_city in region or region in normalized_city:
                    spot_copy["normalized_region"] = region
                    break

            # 매핑되지 않은 경우 원래 도시명 사용
            if "normalized_region" not in spot_copy:
                spot_copy["normalized_region"] = normalized_city

        normalized_spots.append(spot_copy)

    return normalized_spots


def get_region_center(region):
    """
    지역의 중심 좌표 반환
    """
    # 주요 도시 좌표 (실제 좌표)
    region_coords = {
        "서울": (37.5665, 126.9780),
        "부산": (35.1796, 129.0756),
        "대구": (35.8722, 128.6025),
        "인천": (37.4563, 126.7052),
        "광주": (35.1595, 126.8526),
        "대전": (36.3504, 127.3845),
        "울산": (35.5384, 129.3114),
        "세종": (36.4800, 127.2890),
        "경기": (37.4138, 127.5183),
        "강원": (37.8228, 128.1555),
        "충북": (36.8000, 127.7000),
        "충남": (36.5184, 126.8000),
        "전북": (35.8200, 127.1500),
        "전남": (34.8679, 126.9910),
        "경북": (36.4919, 128.8889),
        "경남": (35.4606, 128.2132),
        "제주": (33.4996, 126.5312)
    }

    # 지역명에서 '시', '도', '특별시' 등 제거
    clean_region = region.replace('시', '').replace('도', '').replace('특별', '').replace('광역', '').strip()

    # 일치하는 지역 찾기
    for key, coords in region_coords.items():
        if clean_region in key or key in clean_region:
            return coords

    # 기본값: 서울
    return (37.5665, 126.9780)


def get_nearby_regions(region):
    """
    인접한 지역 목록 반환
    """
    # 지역 인접 관계 정의
    region_adjacency = {
        "서울": ["경기", "인천"],
        "경기": ["서울", "인천", "강원", "충북", "충남"],
        "인천": ["서울", "경기"],
        "강원": ["경기", "충북", "경북"],
        "충북": ["경기", "강원", "충남", "경북", "전북"],
        "충남": ["경기", "충북", "전북", "세종", "대전"],
        "대전": ["충남", "세종"],
        "세종": ["충남", "대전"],
        "전북": ["충남", "충북", "경북", "경남", "전남"],
        "전남": ["전북", "경남", "광주"],
        "광주": ["전남"],
        "경북": ["강원", "충북", "전북", "경남", "대구", "울산"],
        "경남": ["전북", "전남", "경북", "울산", "부산"],
        "대구": ["경북"],
        "울산": ["경북", "경남", "부산"],
        "부산": ["경남", "울산"],
        "제주": []
    }

    # 지역명에서 '시', '도', '특별시' 등 제거
    clean_region = region.replace('시', '').replace('도', '').replace('특별', '').replace('광역', '').strip()

    # 인접 지역 찾기
    for key, adjacents in region_adjacency.items():
        if clean_region in key or key in clean_region:
            return adjacents

    # 기본적으로 큰 지역 반환
    return ["서울", "부산", "대구", "인천", "광주", "대전", "울산"]


def get_additional_spots_from_region(lat, lng, region, categories, count, existing_spots):
    """
    다른 지역에서 추가 장소 검색 (한국관광공사 API의 지역 검색 사용)
    카테고리별로 균등하게 장소를 추천함 (round-robin 방식)
    """
    # 카테고리별 추천 장소를 저장할 딕셔너리
    category_spots = {cat: [] for cat in categories}

    # 지역 코드 (공공데이터포털 지역코드)
    area_codes = {
        "서울": "1",
        "인천": "2",
        "대전": "3",
        "대구": "4",
        "광주": "5",
        "부산": "6",
        "울산": "7",
        "세종": "8",
        "경기": "31",
        "강원": "32",
        "충북": "33",
        "충남": "34",
        "경북": "35",
        "경남": "36",
        "전북": "37",
        "전남": "38",
        "제주": "39"
    }

    # 지역에 맞는 코드 찾기
    area_code = None
    for key, code in area_codes.items():
        if key in region or region in key:
            area_code = code
            break

    if not area_code:
        return []

    # 지역 기반 관광정보 조회 API - 각 카테고리별로 장소 수집
    for cat in categories:
        url = "http://apis.data.go.kr/B551011/KorService2/areaBasedList2"
        params = {
            "serviceKey": DATA_SERVICE_KEY,
            "areaCode": area_code,
            # "cat1": cat,
            "contentTypeId": cat,
            "MobileOS": "ETC",
            "MobileApp": "Konnect",
            "_type": "json",
            "numOfRows": 50,
            "arrange": "O"
        }

        try:
            res = requests.get(url, params=params)
            items = res.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])

            if not items:
                continue

            random.shuffle(items)

            for item in items:
                if item.get("title") and item.get("mapy") and item.get("mapx"):
                    place = {
                        "spot": item.get("title"),
                        "city": region,
                        "district": item.get("addr1", "").split()[1] if item.get("addr1") and len(
                            item.get("addr1", "").split()) > 1 else "",
                        "neighborhood": item.get("addr1", "").split()[2:] if item.get("addr1") and len(
                            item.get("addr1", "").split()) > 2 else [],
                        "lat": item.get("mapy"),
                        "lng": item.get("mapx"),
                        "normalized_region": region,
                        "category": cat  # 카테고리 정보 추가
                    }

                    key = (place.get("spot"), place.get("lat"), place.get("lng"))
                    if key not in existing_spots:
                        category_spots[cat].append(place)
        except Exception as e:
            print(f"Failed to fetch additional spots for category {cat} in {region}:", e)

    # Round-robin 방식으로 카테고리별로 장소 할당
    additional_spots = []
    added_something = True
    
    while len(additional_spots) < count and added_something:
        added_something = False
        for cat in categories:
            if len(additional_spots) >= count:
                break
                
            if category_spots[cat]:
                place = category_spots[cat].pop(0)
                key = (place.get("spot"), place.get("lat"), place.get("lng"))
                additional_spots.append(place)
                existing_spots.add(key)
                added_something = True

    return additional_spots


def get_bulk_recommendations(lat, lng, region, categories, count, existing_spots, radius=5000):
    """
    특정 지역 내에서 필요한 만큼 추천 장소 한번에 가져오기
    카테고리별로 균등하게 장소를 추천함 (round-robin 방식)
    """
    print(lat)
    print(lng)
    recommendations = []
    max_attempts = 5  # 최대 시도 횟수
    attempts = 0
    
    # 카테고리별 추천 장소를 저장할 딕셔너리
    category_spots = {cat: [] for cat in categories}
    
    # 다양한 반경으로 시도하면서 필요한 장소 수를 채울 때까지 반복
    while len(recommendations) < count and attempts < max_attempts:
        # 각 카테고리별로 API 호출하여 결과 저장
        for cat in categories:
            print(cat)

            url = "http://apis.data.go.kr/B551011/KorService2/locationBasedList2"
            params = {
                "serviceKey": DATA_SERVICE_KEY,
                "mapX": lng,
                "mapY": lat,
                "radius": radius,
                # "cat1": cat,
                "contentTypeId": cat,
                "MobileOS": "ETC",
                "MobileApp": "Konnect",
                "_type": "json",
                "numOfRows": 100,  # 많은 결과 요청
                "arrange": "O"
            }

            try:
                res = requests.get(url, params=params)
                items = res.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])

                if not items:
                    continue

                random.shuffle(items)  # 다양성을 위해 섞기

                # 이 카테고리의 유효한 장소들 수집
                valid_places = []
                for item in items:
                    # 해당 지역인지 확인
                    item_city = item.get("addr1", "").split()[0] if item.get("addr1") else ""
                    normalized_item_city = normalize_region_name(item_city)

                    # 지역 일치 여부 확인
                    if (region in normalized_item_city or normalized_item_city in region or
                        region in item.get("areacode", "") or
                        any(region in tag for tag in [item.get("tag", "")])) and item.get("title"):

                        place = {
                            "spot": item.get("title"),
                            "city": item_city if item_city else region,
                            "district": item.get("addr1", "").split()[1] if item.get("addr1") and len(
                                item.get("addr1", "").split()) > 1 else "",
                            "neighborhood": item.get("addr1", "").split()[2:] if item.get("addr1") and len(
                                item.get("addr1", "").split()) > 2 else [],
                            "lat": item.get("mapy"),
                            "lng": item.get("mapx"),
                            "normalized_region": region,
                            "category": cat  # 카테고리 정보 추가
                        }

                        key = (place.get("spot"), place.get("lat"), place.get("lng"))
                        if key not in existing_spots:
                            valid_places.append(place)
                
                # 카테고리별 장소 목록에 추가
                category_spots[cat].extend(valid_places)
                
            except Exception as e:
                print(f"Failed to fetch recommendations for category {cat} in {region}:", e)

        # Round-robin 방식으로 카테고리별로 장소 할당
        # 각 카테고리에서 한 개씩 번갈아가며 추가
        added_something = True
        while len(recommendations) < count and added_something:
            added_something = False
            for cat in categories:
                if len(recommendations) >= count:
                    break
                    
                if category_spots[cat]:
                    place = category_spots[cat].pop(0)
                    key = (place.get("spot"), place.get("lat"), place.get("lng"))
                    recommendations.append(place)
                    existing_spots.add(key)
                    added_something = True

        # 장소가 부족하면 반경을 늘리고 다시 시도
        if len(recommendations) < count:
            radius += 10000
            attempts += 1

    # 필요한 장소를 모두 찾지 못한 경우, 다른 지역에서 추가 검색
    if len(recommendations) < count:
        # 주변 지역에서 검색 시도
        nearby_regions = get_nearby_regions(region)

        for nearby_region in nearby_regions:
            if len(recommendations) >= count:
                break

            nearby_center = get_region_center(nearby_region)

            # 주변 지역에서 추가 장소 검색
            additional_spots = get_additional_spots_from_region(
                nearby_center[0], nearby_center[1], nearby_region,
                categories, count - len(recommendations), existing_spots
            )

            recommendations.extend(additional_spots)
            existing_spots.update({(spot.get("spot"), spot.get("lat"), spot.get("lng"))
                                   for spot in additional_spots})

    # 반환된 장소 수가 요청한 수보다 적을 수 있음 (모두 실제 데이터)
    return recommendations


def get_additional_spots_from_category(lat, lng, region, categories, count, existing_spots):
    """
    특정 카테고리에서 추가 장소 검색 (한국관광공사 API의 지역 검색 사용)
    """
    additional_spots = []

    # 지역 코드 (공공데이터포털 지역코드)
    area_codes = {
        "서울": "1",
        "인천": "2",
        "대전": "3",
        "대구": "4",
        "광주": "5",
        "부산": "6",
        "울산": "7",
        "세종": "8",
        "경기": "31",
        "강원": "32",
        "충북": "33",
        "충남": "34",
        "경북": "35",
        "경남": "36",
        "전북": "37",
        "전남": "38",
        "제주": "39"
    }

    # 지역에 맞는 코드 찾기
    area_code = None
    for key, code in area_codes.items():
        if key in region or region in key:
            area_code = code
            break

    if not area_code:
        return additional_spots

    # 지역 기반 관광정보 조회 API
    for cat in categories:
        if len(additional_spots) >= count:
            break

        url = "http://apis.data.go.kr/B551011/KorService2/areaBasedList2"
        params = {
            "serviceKey": DATA_SERVICE_KEY,
            "areaCode": area_code,
            # "cat1": cat,
            "contentTypeId": cat,
            "MobileOS": "ETC",
            "MobileApp": "Konnect",
            "_type": "json",
            "numOfRows": 50,
            "arrange": "O"
        }

        try:
            res = requests.get(url, params=params)
            items = res.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])

            if not items:
                continue

            random.shuffle(items)

            for item in items:
                if len(additional_spots) >= count:
                    break

                if item.get("title") and item.get("mapy") and item.get("mapx"):
                    place = {
                        "spot": item.get("title"),
                        "city": region,
                        "district": item.get("addr1", "").split()[1] if item.get("addr1") and len(
                            item.get("addr1", "").split()) > 1 else "",
                        "neighborhood": item.get("addr1", "").split()[2:] if item.get("addr1") and len(
                            item.get("addr1", "").split()) > 2 else [],
                        "lat": item.get("mapy"),
                        "lng": item.get("mapx"),
                        "normalized_region": region,
                        "category": cat  # 카테고리 정보 추가
                    }

                    key = (place.get("spot"), place.get("lat"), place.get("lng"))
                    if key not in existing_spots:
                        additional_spots.append(place)
                        existing_spots.add(key)
        except Exception as e:
            print(f"Failed to fetch additional spots for category {cat} in {region}:", e)

    return additional_spots


def create_complete_spot_list(user_spots, region_days, categories):
    """
    각 지역별로 필요한 모든 장소 리스트 생성 (사용자 입력 + 추천 장소)
    정규화된 지역명 사용
    """
    # 지역별 전체 장소 리스트 초기화
    complete_spots = {}

    # 지역별 사용자 입력 장소 분류 (정규화된 지역명 사용)
    region_user_spots = {}
    for region in region_days.keys():
        region_user_spots[region] = []

        for spot in user_spots:
            normalized_region = spot.get("normalized_region", "")
            if normalized_region == region:
                region_user_spots[region].append(spot)

    # 이미 할당된 장소 추적
    all_spots = set()

    # 각 지역별로 처리
    for region, days in region_days.items():
        # 필요한 총 장소 수 (하루에 3개씩)
        total_needed = days * 3

        # 사용자 입력 장소
        user_spots_for_region = region_user_spots.get(region, [])

        # 사용자 입력 장소 중복 제거
        unique_user_spots = []
        for spot in user_spots_for_region:
            key = (spot.get("spot"), spot.get("lat"), spot.get("lng"))
            if key not in all_spots:
                unique_user_spots.append(spot)
                all_spots.add(key)

        # 추가로 필요한 장소 수
        additional_needed = total_needed - len(unique_user_spots)

        # 지역 중심 좌표 계산
        region_center = get_region_center(region)

        # 추천 장소 가져오기 (실제 데이터만)
        recommended_spots = []
        if additional_needed > 0:
            recommended_spots = get_bulk_recommendations(
                region_center[0], region_center[1],
                region, categories, additional_needed, all_spots
            )

        # 지역별 전체 장소 리스트 (사용자 입력 + 추천)
        complete_spots[region] = unique_user_spots + recommended_spots

        print(f"지역: {region}, 사용자 입력: {len(unique_user_spots)}개, 추천: {len(recommended_spots)}개")

    return complete_spots


def optimize_daily_route(spots):
    """
    하루 일정의 최적 경로 계산 (간단한 TSP)
    숙박시설(카테고리 ID 32)은 항상 마지막에 배치
    """
    if len(spots) <= 1:
        return spots
    
    # 숙박시설과 그 외 장소 분리
    ACCOMMODATION_CATEGORY = "32"  # 숙박 카테고리 ID
    accommodation_spots = [spot for spot in spots if spot.get("category") == ACCOMMODATION_CATEGORY]
    other_spots = [spot for spot in spots if spot.get("category") != ACCOMMODATION_CATEGORY]
    
    # 숙박시설이 있는 경우, 숙박시설은 제외하고 나머지 장소들만 최적화
    if accommodation_spots:
        # 숙박시설이 없는 장소들에 대해서만 최적 경로 계산
        if len(other_spots) <= 1:
            optimized_spots = other_spots
        else:
            # 거리 행렬 계산
            n = len(other_spots)
            distance_matrix = np.zeros((n, n))
            
            for i in range(n):
                for j in range(n):
                    if i != j:
                        try:
                            coord1 = (float(other_spots[i].get("lat", 0)), float(other_spots[i].get("lng", 0)))
                            coord2 = (float(other_spots[j].get("lat", 0)), float(other_spots[j].get("lng", 0)))
                            distance_matrix[i][j] = geodesic(coord1, coord2).km
                        except (ValueError, TypeError):
                            distance_matrix[i][j] = 999999  # 거리 계산 실패시 큰 값 할당
            
            # Greedy TSP 알고리즘으로 최적 경로 찾기
            current = 0  # 첫 번째 장소에서 시작
            path = [current]
            unvisited = set(range(1, n))
            
            while unvisited:
                next_spot = min(unvisited, key=lambda x: distance_matrix[current][x])
                path.append(next_spot)
                unvisited.remove(next_spot)
                current = next_spot
            
            # 최적화된 경로대로 spots 재정렬
            optimized_spots = [other_spots[i] for i in path]
        
        # 숙박시설을 마지막에 추가
        return optimized_spots + accommodation_spots
    
    # 숙박시설이 없는 경우 기존 로직 적용
    else:
        # 거리 행렬 계산
        n = len(spots)
        distance_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    try:
                        coord1 = (float(spots[i].get("lat", 0)), float(spots[i].get("lng", 0)))
                        coord2 = (float(spots[j].get("lat", 0)), float(spots[j].get("lng", 0)))
                        distance_matrix[i][j] = geodesic(coord1, coord2).km
                    except (ValueError, TypeError):
                        distance_matrix[i][j] = 999999  # 거리 계산 실패시 큰 값 할당
        
        # Greedy TSP 알고리즘으로 최적 경로 찾기
        current = 0  # 첫 번째 장소에서 시작
        path = [current]
        unvisited = set(range(1, n))
        
        while unvisited:
            next_spot = min(unvisited, key=lambda x: distance_matrix[current][x])
            path.append(next_spot)
            unvisited.remove(next_spot)
            current = next_spot
        
        # 최적화된 경로대로 spots 재정렬
        return [spots[i] for i in path]


def cluster_spots_by_date(complete_spots, region_dates):
    """
    각 지역 내 장소들을 날짜별로 클러스터링 (이동 거리 최소화)
    각 일정에 다양한 카테고리가 고르게 분포되도록 함
    각 날짜에 최소 3개의 장소가 포함되도록 보장
    숙박(카테고리 ID 32)은 하루에 최대 1개만 포함되도록 함
    """
    schedule = {}
    MIN_SPOTS_PER_DAY = 3  # 하루에 필요한 최소 장소 수
    ACCOMMODATION_CATEGORY = "32"  # 숙박 카테고리 ID

    # 지역별로 처리
    for region, dates in region_dates.items():
        region_spots = complete_spots.get(region, [])

        if not region_spots or not dates:
            continue

        print(f"지역 {region} 클러스터링 시작: {len(region_spots)}개 장소, {len(dates)}일")

        # 지역 내 장소 수
        n_spots = len(region_spots)
        # 지역에 할당된 날짜 수
        n_days = len(dates)

        # 카테고리별로 장소 분류
        category_spots = {}
        for spot in region_spots:
            cat = spot.get("category", "unknown")
            if cat not in category_spots:
                category_spots[cat] = []
            category_spots[cat].append(spot)

        # 모든 날짜에 대한 초기 스케줄 생성
        for date in dates:
            schedule[date] = []

        # 날짜별로 장소 할당
        if n_days == 1:
            # 하루 일정인 경우 카테고리 균등 분배 + 거리 최적화
            daily_spots = []
            accommodation_added = False  # 숙박 장소 추가 여부 추적
            
            # 각 카테고리에서 최대 1개씩 선택 (round-robin)
            categories = list(category_spots.keys())
            while len(daily_spots) < MIN_SPOTS_PER_DAY and (categories or any(category_spots.values())):
                # 아직 남은 카테고리가 있는 경우
                if categories:
                    for cat in list(categories):
                        if len(daily_spots) >= MIN_SPOTS_PER_DAY:
                            break
                        # 숙박 카테고리인 경우 이미 추가되었는지 확인
                        if cat == ACCOMMODATION_CATEGORY and accommodation_added:
                            categories.remove(cat)
                            continue
                        if category_spots[cat]:
                            spot = category_spots[cat].pop(0)
                            daily_spots.append(spot)
                            # 숙박 카테고리 추가 여부 업데이트
                            if cat == ACCOMMODATION_CATEGORY:
                                accommodation_added = True
                        else:
                            categories.remove(cat)
                # 카테고리는 없지만 아직 장소가 남아있는 경우
                else:
                    for cat in list(category_spots.keys()):
                        if category_spots[cat] and len(daily_spots) < MIN_SPOTS_PER_DAY:
                            # 숙박 카테고리인 경우 이미 추가되었는지 확인
                            if cat == ACCOMMODATION_CATEGORY and accommodation_added:
                                continue
                            spot = category_spots[cat].pop(0)
                            daily_spots.append(spot)
                            # 숙박 카테고리 추가 여부 업데이트
                            if cat == ACCOMMODATION_CATEGORY:
                                accommodation_added = True
            
            schedule[dates[0]] = optimize_daily_route(daily_spots)
        elif n_spots <= MIN_SPOTS_PER_DAY:
            # 장소가 MIN_SPOTS_PER_DAY 이하인 경우, 사용자 지정 장소를 우선 배치
            user_specified_spots = [spot for spot in region_spots if "category" not in spot]
            recommended_spots = [spot for spot in region_spots if "category" in spot]
            
            # 사용자 지정 장소가 있는 경우 날짜별로 분배
            for i, spot in enumerate(user_specified_spots):
                date_index = min(i, len(dates) - 1)
                schedule[dates[date_index]].append(spot)
            
            # 숙박 카테고리 장소 먼저 처리 (날짜별로 최대 1개씩)
            accommodation_spots = [spot for spot in recommended_spots if spot.get("category") == ACCOMMODATION_CATEGORY]
            other_spots = [spot for spot in recommended_spots if spot.get("category") != ACCOMMODATION_CATEGORY]
            
            # 숙박 장소 날짜별로 최대 1개씩 분배
            for i, spot in enumerate(accommodation_spots):
                if i < len(dates):  # 날짜 수보다 많으면 추가하지 않음
                    schedule[dates[i]].append(spot)
            
            # 추천 장소(숙박 제외)를 날짜별로 분배
            for i, spot in enumerate(other_spots):
                # 아직 MIN_SPOTS_PER_DAY에 도달하지 않은 날짜를 찾아 할당
                for date in dates:
                    if len(schedule[date]) < MIN_SPOTS_PER_DAY:
                        schedule[date].append(spot)
                        break
            
            # 각 날짜의 장소 최적화
            for date in dates:
                if schedule[date]:
                    schedule[date] = optimize_daily_route(schedule[date])
        else:
            # 여러 날짜와 충분한 장소가 있는 경우 클러스터링 수행

            # 장소들의 좌표 추출
            coords = []
            valid_spots = []

            for spot in region_spots:
                try:
                    lat = float(spot.get("lat", 0))
                    lng = float(spot.get("lng", 0))
                    if lat != 0 and lng != 0:
                        coords.append([lat, lng])
                        valid_spots.append(spot)
                except (ValueError, TypeError):
                    continue

            if not coords:
                print(f"지역 {region}에 유효한 좌표가 없음")
                continue

            coords = np.array(coords)

            # 클러스터 수 결정 (날짜 수 또는 실제 장소 수 / MIN_SPOTS_PER_DAY, 둘 중 작은 값)
            n_clusters = min(n_days, (len(valid_spots) + MIN_SPOTS_PER_DAY - 1) // MIN_SPOTS_PER_DAY)

            if n_clusters <= 1:
                # 클러스터가 1개인 경우 카테고리 균등 분배 + 날짜별 할당
                # 사용자 지정 장소를 먼저 날짜별로 분배
                user_specified_spots = [spot for spot in valid_spots if "category" not in spot]
                
                for i, spot in enumerate(user_specified_spots):
                    date_index = min(i, len(dates) - 1)
                    schedule[dates[date_index]].append(spot)
                
                # 각 날짜에 숙박 장소가 포함되어 있는지 추적
                accommodation_in_date = {date: False for date in dates}
                
                # 사용자 지정 장소 중 숙박시설이 있는지 확인 (현재는 구분 불가, 추후 확장 가능)
                
                # 나머지 장소(추천 장소)를 카테고리별로 분류
                remaining_spots_by_category = {}
                for spot in valid_spots:
                    if "category" in spot:
                        cat = spot.get("category", "unknown")
                        if cat not in remaining_spots_by_category:
                            remaining_spots_by_category[cat] = []
                        remaining_spots_by_category[cat].append(spot)
                
                # 숙박 장소 먼저 날짜별로 최대 1개씩 할당
                if ACCOMMODATION_CATEGORY in remaining_spots_by_category:
                    accommodation_spots = remaining_spots_by_category[ACCOMMODATION_CATEGORY]
                    for i, date in enumerate(dates):
                        if i < len(accommodation_spots):
                            # 해당 날짜에 아직 숙박 장소가 없으면 추가
                            if not accommodation_in_date[date]:
                                schedule[date].append(accommodation_spots[i])
                                accommodation_in_date[date] = True
                    
                    # 할당된 숙박 장소는 목록에서 제거
                    allocated_count = min(len(dates), len(accommodation_spots))
                    remaining_spots_by_category[ACCOMMODATION_CATEGORY] = accommodation_spots[allocated_count:]
                
                # 각 날짜에 카테고리 균등 분배로 장소 할당
                for date in dates:
                    current_spots = len(schedule[date])
                    if current_spots < MIN_SPOTS_PER_DAY:
                        # 남은 카테고리에서 round-robin 방식으로 장소 추가
                        remaining_categories = list(remaining_spots_by_category.keys())
                        
                        while current_spots < MIN_SPOTS_PER_DAY and (remaining_categories or any(remaining_spots_by_category.values())):
                            if remaining_categories:
                                for cat in list(remaining_categories):
                                    if current_spots >= MIN_SPOTS_PER_DAY:
                                        break
                                    # 숙박 카테고리인 경우 이미 추가되었는지 확인
                                    if cat == ACCOMMODATION_CATEGORY and accommodation_in_date[date]:
                                        remaining_categories.remove(cat)
                                        continue
                                    if remaining_spots_by_category[cat]:
                                        spot = remaining_spots_by_category[cat].pop(0)
                                        schedule[date].append(spot)
                                        current_spots += 1
                                        # 숙박 카테고리 추가 여부 업데이트
                                        if cat == ACCOMMODATION_CATEGORY:
                                            accommodation_in_date[date] = True
                                    else:
                                        remaining_categories.remove(cat)
                            else:
                                # 카테고리가 다 소진됐지만 아직 장소가 필요한 경우
                                for cat in list(remaining_spots_by_category.keys()):
                                    if remaining_spots_by_category[cat] and current_spots < MIN_SPOTS_PER_DAY:
                                        # 숙박 카테고리인 경우 이미 추가되었는지 확인
                                        if cat == ACCOMMODATION_CATEGORY and accommodation_in_date[date]:
                                            continue
                                        spot = remaining_spots_by_category[cat].pop(0)
                                        schedule[date].append(spot)
                                        current_spots += 1
                                        # 숙박 카테고리 추가 여부 업데이트
                                        if cat == ACCOMMODATION_CATEGORY:
                                            accommodation_in_date[date] = True
                    
                    # 최적 경로로 정렬
                    if schedule[date]:
                        schedule[date] = optimize_daily_route(schedule[date])
            else:
                # KMeans 클러스터링 적용
                kmeans = KMeans(n_clusters=n_clusters, random_state=42)
                labels = kmeans.fit_predict(coords)

                # 클러스터별로 장소 그룹화
                clusters = {i: [] for i in range(n_clusters)}
                for i, label in enumerate(labels):
                    clusters[label].append(valid_spots[i])

                # 클러스터 크기로 정렬 (큰 것부터)
                sorted_clusters = sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True)

                # 날짜별로 클러스터 할당
                for i, date in enumerate(dates):
                    if i < len(sorted_clusters):
                        cluster_spots = sorted_clusters[i][1]
                        accommodation_added = False  # 해당 날짜에 숙박 장소 추가 여부
                        
                        # 사용자 지정 장소 먼저 추가
                        user_spots_in_cluster = [spot for spot in cluster_spots if "category" not in spot]
                        for spot in user_spots_in_cluster:
                            schedule[date].append(spot)
                            cluster_spots.remove(spot)
                        
                        # 카테고리별로 장소 분류
                        cluster_categories = {}
                        for spot in cluster_spots:
                            if "category" in spot:
                                cat = spot.get("category", "unknown")
                                if cat not in cluster_categories:
                                    cluster_categories[cat] = []
                                cluster_categories[cat].append(spot)
                        
                        # 다양한 카테고리에서 장소 선택 (round-robin)
                        current_spots = len(schedule[date])
                        remaining_cats = list(cluster_categories.keys())
                        
                        while current_spots < MIN_SPOTS_PER_DAY and (remaining_cats or any(cluster_categories.values())):
                            if remaining_cats:
                                for cat in list(remaining_cats):
                                    if current_spots >= MIN_SPOTS_PER_DAY:
                                        break
                                    # 숙박 카테고리인 경우 이미 추가되었는지 확인
                                    if cat == ACCOMMODATION_CATEGORY and accommodation_added:
                                        remaining_cats.remove(cat)
                                        continue
                                    if cluster_categories[cat]:
                                        spot = cluster_categories[cat].pop(0)
                                        schedule[date].append(spot)
                                        current_spots += 1
                                        # 숙박 카테고리 추가 여부 업데이트
                                        if cat == ACCOMMODATION_CATEGORY:
                                            accommodation_added = True
                                    else:
                                        remaining_cats.remove(cat)
                            else:
                                # 카테고리가 다 소진됐지만 아직 장소가 필요한 경우
                                for cat in list(cluster_categories.keys()):
                                    if cluster_categories[cat] and current_spots < MIN_SPOTS_PER_DAY:
                                        # 숙박 카테고리인 경우 이미 추가되었는지 확인
                                        if cat == ACCOMMODATION_CATEGORY and accommodation_added:
                                            continue
                                        spot = cluster_categories[cat].pop(0)
                                        schedule[date].append(spot)
                                        current_spots += 1
                                        # 숙박 카테고리 추가 여부 업데이트
                                        if cat == ACCOMMODATION_CATEGORY:
                                            accommodation_added = True
                        
                        # 최적 경로로 정렬
                        if schedule[date]:
                            schedule[date] = optimize_daily_route(schedule[date])
                    else:
                        schedule[date] = []
    
    # 최종 검증: 각 날짜에 최소 MIN_SPOTS_PER_DAY개의 장소가 있는지 확인
    ensure_minimum_spots_per_day(schedule, complete_spots, MIN_SPOTS_PER_DAY)
    
    return schedule


def ensure_minimum_spots_per_day(schedule, complete_spots, min_spots):
    """
    모든 날짜에 최소한의 장소가 있는지 확인하고, 부족한 경우 추가
    숙박(카테고리 ID 32)은 하루에 최대 1개만 포함되도록 함
    """
    ACCOMMODATION_CATEGORY = "32"  # 숙박 카테고리 ID
    
    # 모든 남은 장소들을 모음 (숙박 장소와 기타 장소 구분)
    remaining_accommodation_spots = []
    remaining_other_spots = []
    
    for region, spots in complete_spots.items():
        # 이미 스케줄에 할당된 장소 ID를 추적
        scheduled_spot_ids = set()
        for date, day_spots in schedule.items():
            for spot in day_spots:
                # 장소 식별을 위한 키 생성 (spot, lat, lng 조합)
                spot_key = (spot.get("spot"), spot.get("lat"), spot.get("lng"))
                scheduled_spot_ids.add(spot_key)
        
        # 아직 할당되지 않은 장소 찾기
        for spot in spots:
            spot_key = (spot.get("spot"), spot.get("lat"), spot.get("lng"))
            if spot_key not in scheduled_spot_ids:
                # 숙박 장소와 기타 장소 구분
                if spot.get("category") == ACCOMMODATION_CATEGORY:
                    remaining_accommodation_spots.append(spot)
                else:
                    remaining_other_spots.append(spot)
    
    # 각 날짜에 숙박 장소가 이미 있는지 확인
    accommodation_in_date = {}
    for date, day_spots in schedule.items():
        accommodation_in_date[date] = any(spot.get("category") == ACCOMMODATION_CATEGORY for spot in day_spots)
    
    # 장소가 부족한 날짜에 남은 장소 추가
    for date, day_spots in schedule.items():
        if len(day_spots) < min_spots:
            spots_needed = min_spots - len(day_spots)
            print(f"날짜 {date}에 {spots_needed}개 장소 추가 필요")
            
            # 현재 날짜에 숙박 장소가 없고, 남은 숙박 장소가 있다면 먼저 추가
            if not accommodation_in_date[date] and remaining_accommodation_spots:
                best_accommodation_spot = find_closest_spot(day_spots, remaining_accommodation_spots)
                if best_accommodation_spot:
                    day_spots.append(best_accommodation_spot)
                    remaining_accommodation_spots.remove(best_accommodation_spot)
                    accommodation_in_date[date] = True
                    spots_needed -= 1
            
            # 나머지 필요한 장소 추가
            for _ in range(spots_needed):
                if remaining_other_spots:
                    # 가장 가까운 비숙박 장소 선택
                    best_spot = find_closest_spot(day_spots, remaining_other_spots)
                    if best_spot:
                        day_spots.append(best_spot)
                        remaining_other_spots.remove(best_spot)
                    else:
                        break  # 적합한 장소를 찾을 수 없음
                elif not accommodation_in_date[date] and remaining_accommodation_spots:
                    # 남은 비숙박 장소가 없고, 숙박 장소가 아직 없다면 숙박 장소 추가
                    best_spot = remaining_accommodation_spots.pop(0)
                    day_spots.append(best_spot)
                    accommodation_in_date[date] = True
                else:
                    print(f"날짜 {date}에 추가할 장소가 더 이상 없음")
                    break
            
            # 경로 최적화
            if day_spots:
                schedule[date] = optimize_daily_route(day_spots)


def find_closest_spot(existing_spots, candidate_spots):
    """
    기존 장소들과 가장 가까운 후보 장소 찾기
    """
    if not candidate_spots:
        return None
    
    if not existing_spots:
        return candidate_spots[0]
    
    best_spot = None
    min_distance = float('inf')
    
    for spot in candidate_spots:
        try:
            spot_coord = (float(spot.get("lat", 0)), float(spot.get("lng", 0)))
            avg_distance = 0
            
            for existing_spot in existing_spots:
                existing_coord = (float(existing_spot.get("lat", 0)), float(existing_spot.get("lng", 0)))
                avg_distance += geodesic(spot_coord, existing_coord).km
            
            avg_distance /= len(existing_spots)
            
            if avg_distance < min_distance:
                min_distance = avg_distance
                best_spot = spot
        except (ValueError, TypeError):
            continue
    
    return best_spot


def advanced_schedule_planning(info, start_date_str, end_date_str, departure_city, arrival_city, categories):
    """
    지역 기반 일정 분배 및 최적화 알고리즘

    Args:
        info: 사용자가 입력한 장소 목록
        start_date_str: 시작 날짜 (YYYY-MM-DD)
        end_date_str: 종료 날짜 (YYYY-MM-DD)
        departure_city: 출발 도시
        arrival_city: 도착 도시
        categories: 장소 카테고리 목록

    Returns:
        날짜별 최적화된 일정
    """
    # 날짜 정보 준비
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    days = (end_date - start_date).days + 1
    date_list = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

    print(f"총 여행 일수: {days}일")

    # 1. 지역 추출 및 중복 제거, 효율적인 경로 생성
    regions = extract_and_organize_regions(info, departure_city, arrival_city)
    print(f"최적화된 여행 지역 순서: {regions}")

    # 2. 지역별 일수 할당
    region_days = allocate_days_to_regions(regions, days)
    print(f"지역별 할당 일수: {region_days}")

    # 3. 지역별 날짜 매핑
    region_dates = map_regions_to_dates(region_days, date_list)
    print(f"지역별 날짜 매핑: {region_dates}")

    # 4. 사용자 입력 장소의 지역명 정규화
    normalized_spots = map_user_spots_to_normalized_regions(info, region_days)

    # 5. 지역별 전체 일정 생성 (사용자 입력 + 추천 장소)
    complete_spots = create_complete_spot_list(normalized_spots, region_days, categories)
    print(f"지역별 총 장소 수: {', '.join([f'{region}: {len(spots)}개' for region, spots in complete_spots.items()])}")

    # 6. 날짜별로 클러스터링하여 일정 최적화
    optimized_schedule = cluster_spots_by_date(complete_spots, region_dates)

    return optimized_schedule


def fixed_region_schedule(info, start_date_str, end_date_str, departure_city, arrival_city, categories):
    """
    향상된 일정 계획 알고리즘 (지역 기반 클러스터링)

    이 함수는 기존 함수명을 유지하면서 내부적으로 advanced_schedule_planning을 호출
    """
    return advanced_schedule_planning(info, start_date_str, end_date_str, departure_city, arrival_city, categories)


