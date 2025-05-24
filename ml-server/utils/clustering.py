from sklearn.cluster import KMeans
from datetime import datetime, timedelta
import numpy as np
from geopy.distance import geodesic
import requests
import random
from dotenv import load_dotenv, find_dotenv
import os
import re

load_dotenv(find_dotenv())
DATA_SERVICE_KEY = os.getenv("DATA_SERVICE_KEY")


# def info_based_cluster_assignment(info_list, dist_matrix, start_date_str, end_date_str):
#     start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
#     end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
#     days = (end_date - start_date).days + 1
#     date_list = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
#
#     schedule = {d: [] for d in date_list}
#     total_spots = len(info_list)
#
#     # 시(city) 기준으로 분리
#     city_map = {}
#     for i, spot in enumerate(info_list):
#         city = spot["city"]
#         city_map.setdefault(city, []).append(i)
#
#     # 날짜 인덱스 유지
#     date_idx = 0
#
#     for city, idxs in city_map.items():
#         portion = max(1, round(len(idxs) / total_spots * days))
#         portion = min(portion, len(idxs), days - date_idx)
#
#         # 거리 행렬 부분 추출
#         sub_matrix = np.array([dist_matrix[i] for i in idxs])
#
#         if portion == 1 or len(idxs) == 1:
#             schedule[date_list[date_idx]].append(info_list[idxs[0]])
#             date_idx += 1
#         else:
#             kmeans = KMeans(n_clusters=portion, random_state=42)
#             labels = kmeans.fit_predict(sub_matrix)
#             cluster_map = {i: [] for i in range(portion)}
#             for i, label in zip(idxs, labels):
#                 cluster_map[label].append(info_list[i])
#
#             for label in sorted(cluster_map.keys()):
#                 if date_idx >= len(date_list):
#                     break
#                 schedule[date_list[date_idx]].extend(cluster_map[label])
#                 date_idx += 1
#
#     return schedule


CITY_COORDS = {
    "seoul": (37.5665, 126.9780),
    "busan": (35.1796, 129.0756),
    "incheon": (37.4563, 126.7052),
    "jeju": (33.4996, 126.5312),
    "daegu": (35.8722, 128.6025),
    "daejeon": (36.3504, 127.3845),
    "gwangju": (35.1595, 126.8526),
    "suwon": (37.2636, 127.0286),
    "ulsan": (35.5384, 129.3114),
    "gangneung": (37.7519, 128.8761)
}


def get_city_coord(city_name):
    for known_city, coord in CITY_COORDS.items():
        if known_city in city_name:
            return coord
    return None  # 알 수 없는 도시일 경우 None 반환


def fixed_region_schedule(info, start_date_str, end_date_str, departure_city, arrival_city, categories):
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    days = (end_date - start_date).days + 1
    date_list = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

    # 출발 도시, 도착 도시 좌표
    dep_coord = get_city_coord(departure_city)
    arr_coord = get_city_coord(arrival_city)

    def spot_score(spot):
        spot_coord = (spot.get("lat", 0), spot.get("lng", 0))
        dep_dist = geodesic(dep_coord, spot_coord).km if dep_coord else 0
        arr_dist = geodesic(arr_coord, spot_coord).km if arr_coord else 0
        total_score = (dep_dist / (dep_dist + arr_dist + 1e-6)) * (days - 1)
        return total_score

    sorted_spots = sorted(info, key=spot_score)
    schedule = {d: [] for d in date_list}

    for i, spot in enumerate(sorted_spots):
        date = date_list[i] if i < len(date_list) else date_list[-1]
        schedule[date].append(spot)

    for idx, date in enumerate(date_list):
        if not schedule[date]:
            anchor = None
            for j in range(idx - 1, -1, -1):
                if schedule[date_list[j]]:
                    anchor = schedule[date_list[j]][-1]
                    break
            if anchor:
                schedule[date].append({
                    "spot": f"PLACEHOLDER from {anchor['spot']}",
                    "city": anchor["city"],
                    "lat": anchor["lat"],
                    "lng": anchor["lng"]
                })

    schedule = fill_schedule_with_recommendations(schedule, categories)
    return schedule


def fill_schedule_with_recommendations(schedule, categories):
    seen_spots = set()

    for date, spots in schedule.items():
        anchor_spot = None
        new_spots = []
        for s in spots:
            if s.get("spot", "").startswith("PLACEHOLDER"):
                anchor_spot = s
            else:
                key = (s.get("spot"), s.get("lat"), s.get("lng"))
                if key not in seen_spots:
                    new_spots.append(s)
                    seen_spots.add(key)
                    if not anchor_spot:
                        anchor_spot = s
        schedule[date] = new_spots

        if len(schedule[date]) >= 3:
            continue

        if not anchor_spot or not anchor_spot.get("lat") or not anchor_spot.get("lng"):
            continue

        lat = anchor_spot["lat"]
        lng = anchor_spot["lng"]
        needed = 3 - len(schedule[date])

        for cat in categories:
            if needed <= 0:
                break

            url = "http://apis.data.go.kr/B551011/KorService2/locationBasedList2"
            params = {
                "serviceKey": DATA_SERVICE_KEY,
                "mapX": lng,
                "mapY": lat,
                "radius": 5000,
                "cat1": cat,
                "MobileOS": "ETC",
                "MobileApp": "Konnect",
                "_type": "json",
                "numOfRows": 10,
                "arrange": "O"
            }
            try:
                res = requests.get(url, params=params)
                items = res.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])
                random.shuffle(items)
                # print("=====item=====")
                for item in items:
                    if needed <= 0:
                        break

                    # print(item)
                    place = {
                        "spot": item.get("title"),
                        "city": item.get("addr1", "").split()[0],
                        "district": item.get("addr1", "").split()[1],
                        "neighborhood": item.get("addr1", "").split()[2:],
                        "lat": item.get("mapy"),
                        "lng": item.get("mapx")
                    }
                    key = (place.get("spot"), place.get("lat"), place.get("lng"))
                    if key not in seen_spots:
                        schedule[date].append(place)
                        seen_spots.add(key)
                        needed -= 1
            except Exception as e:
                print(f"Failed to fetch for category {cat} on {date}:", e)

    return schedule
