import requests
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
import numpy as np

def get_distance_matrix(spots):
    coordinates = ";".join([f"{s['lng']},{s['lat']}" for s in spots])
    url = f"http://175.125.92.35:5010/table/v1/driving/{coordinates}?annotations=distance"
    try:
        res = requests.get(url)
        res.raise_for_status()
        print(res.json()['distances'])
        return res.json()["distances"]  # 2D 리스트 반환
    except Exception as e:
        print("OSRM /table error:", e)
        return None

def cluster_spots(dist_matrix, n_clusters):
    dist_array = np.array(dist_matrix)
    model = KMeans(n_clusters=n_clusters, random_state=42)
    labels = model.fit_predict(dist_array)
    return labels

def assign_clusters_to_dates(spots, labels, start_date, end_date):
    day_count = (end_date - start_date).days + 1
    date_list = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(day_count)]

    clustered_schedule = {d: [] for d in date_list}
    cluster_to_spots = {}

    for idx, label in enumerate(labels):
        cluster_to_spots.setdefault(label, []).append(spots[idx])

    for i, (cluster_id, spots_in_cluster) in enumerate(cluster_to_spots.items()):
        day = date_list[i % day_count]
        clustered_schedule[day].extend(spots_in_cluster)

    return clustered_schedule

def distribute_must_spots_by_cluster(spots, start_date_str, end_date_str):
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    days = (end_date - start_date).days + 1

    dist_matrix = get_distance_matrix(spots)
    if not dist_matrix:
        return {}

    n_clusters = min(days, len(spots))


    labels = cluster_spots(dist_matrix, n_clusters=n_clusters)
    return assign_clusters_to_dates(spots, labels, start_date, end_date)
