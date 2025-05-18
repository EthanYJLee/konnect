from sklearn.cluster import KMeans
from datetime import datetime, timedelta
import numpy as np

def info_based_cluster_assignment(info_list, dist_matrix, start_date_str, end_date_str):
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    days = (end_date - start_date).days + 1
    date_list = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

    schedule = {d: [] for d in date_list}
    total_spots = len(info_list)

    # 시(city) 기준으로 분리
    city_map = {}
    for i, spot in enumerate(info_list):
        city = spot["city"]
        city_map.setdefault(city, []).append(i)

    # 날짜 인덱스 유지
    date_idx = 0

    for city, idxs in city_map.items():
        portion = max(1, round(len(idxs) / total_spots * days))
        portion = min(portion, len(idxs), days - date_idx)

        # 거리 행렬 부분 추출
        sub_matrix = np.array([dist_matrix[i] for i in idxs])

        if portion == 1 or len(idxs) == 1:
            schedule[date_list[date_idx]].append(info_list[idxs[0]])
            date_idx += 1
        else:
            kmeans = KMeans(n_clusters=portion, random_state=42)
            labels = kmeans.fit_predict(sub_matrix)
            cluster_map = {i: [] for i in range(portion)}
            for i, label in zip(idxs, labels):
                cluster_map[label].append(info_list[i])

            for label in sorted(cluster_map.keys()):
                if date_idx >= len(date_list):
                    break
                schedule[date_list[date_idx]].extend(cluster_map[label])
                date_idx += 1

    return schedule