from utils.recommendation import get_bulk_recommendations
import json

# 테스트 파라미터
lat = 37.5665  # 서울 위도
lng = 126.9780  # 서울 경도
region = "서울"
categories = ['12', '14', '15']  # 3개 카테고리 테스트
count = 9  # 총 9개 장소 요청 (카테고리별 3개씩 예상)
existing_spots = set()

print(f"Testing get_bulk_recommendations function")
print(f"Location: {lat}, {lng} (Seoul)")
print(f"Categories: {categories}")
print(f"Requesting {count} spots")

# get_bulk_recommendations 함수 직접 호출
spots = get_bulk_recommendations(lat, lng, region, categories, count, existing_spots)

print(f"\nTotal spots returned: {len(spots)}")

# 카테고리별 분포 확인
category_counts = {}
for spot in spots:
    cat = spot.get('category', 'unknown')
    if cat not in category_counts:
        category_counts[cat] = 0
    category_counts[cat] += 1

print("\nCategory distribution:")
print(json.dumps(category_counts, indent=2))

# 각 카테고리의 장소 이름 출력
print("\nSpots by category:")
for cat in categories:
    cat_spots = [spot['spot'] for spot in spots if spot.get('category') == cat]
    print(f"\nCategory {cat} ({len(cat_spots)} spots):")
    for i, spot_name in enumerate(cat_spots):
        print(f"  {i+1}. {spot_name}") 