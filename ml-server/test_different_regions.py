from utils.recommendation import extract_and_organize_regions
import json

# 테스트 데이터 생성 (서울 출발/도착, 부산 명소 포함)
test_spots = [
    {
        'id': 1,
        'spot': '서울타워',
        'name': '서울타워',
        'city': '서울',
        'lat': '37.5665',
        'lng': '126.9780',
        'place_id': 'test1'
    },
    {
        'id': 2,
        'spot': '해운대해수욕장',
        'name': '해운대해수욕장',
        'city': '부산',
        'lat': '35.1586',
        'lng': '129.1602',
        'place_id': 'test2'
    },
    {
        'id': 3,
        'spot': '경복궁',
        'name': '경복궁',
        'city': '서울',
        'lat': '37.5796',
        'lng': '126.9770',
        'place_id': 'test3'
    }
]

# 출발지와 도착지 (둘 다 서울)
departure_city = '서울'
arrival_city = '서울'

print(f"테스트 시작: 출발지와 도착지는 {departure_city}이지만, 명소 중에 {test_spots[1]['city']}({test_spots[1]['spot']})가 포함됨")

# 지역 정보 추출 및 경로 생성
regions = extract_and_organize_regions(test_spots, departure_city, arrival_city)

print(f"\n생성된 여행 경로: {regions}")
print(f"경로에 출발지 '{departure_city}' 포함: {'O' if departure_city in regions else 'X'}")
print(f"경로에 도착지 '{arrival_city}' 포함: {'O' if arrival_city in regions else 'X'}")
print(f"경로에 다른 지역 '{test_spots[1]['city']}' 포함: {'O' if test_spots[1]['city'] in regions else 'X'}")

# 테스트 2: 출발지와 도착지가 다른 경우
departure_city2 = '서울'
arrival_city2 = '부산'

print(f"\n\n테스트 2 시작: 출발지는 {departure_city2}, 도착지는 {arrival_city2}")

# 지역 정보 추출 및 경로 생성
regions2 = extract_and_organize_regions(test_spots, departure_city2, arrival_city2)

print(f"\n생성된 여행 경로: {regions2}")
print(f"경로에 출발지 '{departure_city2}' 포함: {'O' if departure_city2 in regions2 else 'X'}")
print(f"경로에 도착지 '{arrival_city2}' 포함: {'O' if arrival_city2 in regions2 else 'X'}")

# 테스트 3: 출발지와 도착지는 같지만, 완전히 다른 지역의 명소만 포함된 경우
test_spots3 = [
    {
        'id': 1,
        'spot': '해운대해수욕장',
        'name': '해운대해수욕장',
        'city': '부산',
        'lat': '35.1586',
        'lng': '129.1602',
        'place_id': 'test2'
    },
    {
        'id': 2,
        'spot': '광안리해수욕장',
        'name': '광안리해수욕장',
        'city': '부산',
        'lat': '35.1530',
        'lng': '129.1185',
        'place_id': 'test4'
    }
]

departure_city3 = '서울'
arrival_city3 = '서울'

print(f"\n\n테스트 3 시작: 출발지와 도착지는 {departure_city3}이지만, 모든 명소가 {test_spots3[0]['city']}에 위치")

# 지역 정보 추출 및 경로 생성
regions3 = extract_and_organize_regions(test_spots3, departure_city3, arrival_city3)

print(f"\n생성된 여행 경로: {regions3}")
print(f"경로에 출발지 '{departure_city3}' 포함: {'O' if departure_city3 in regions3 else 'X'}")
print(f"경로에 도착지 '{arrival_city3}' 포함: {'O' if arrival_city3 in regions3 else 'X'}")
print(f"경로에 다른 지역 '{test_spots3[0]['city']}' 포함: {'O' if test_spots3[0]['city'] in regions3 else 'X'}") 