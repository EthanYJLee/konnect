from flask import Flask, request, jsonify
import pickle
import joblib
from flask_cors import CORS
from datetime import datetime, timedelta
import requests
from utils.schedule_utils import distribute_must_spots_by_cluster, get_distance_matrix
import json
from utils.geocode import reverse_geocode
import time
from utils.clustering import info_based_cluster_assignment


# Flask 초기화
app = Flask(__name__)
CORS(app)


# 모델 로딩
vectorizer = joblib.load("models/vectorizer.pkl")
classifier = joblib.load("models/classifier.pkl")


@app.route("/classifyChat", methods=["POST"])
def classify():
    data = request.get_json()
    text = data.get("text", "")
    if not text.strip():
        return jsonify({"error": "text is required"}), 400

    # 벡터화 후 분류
    X = vectorizer.transform([text])
    print(X)
    prediction = classifier.predict(X)[0]
    print(prediction)
    return jsonify({"category": prediction})


@app.route("/generateItinerary", methods=["POST"])
def generate_itinerary():
    data = request.get_json()
    # print(json.dumps(data, indent=2))
    # print(data)

    # 카테고리
    print(data['categories'])
    # 날짜 계산
    start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
    end_date = datetime.strptime(data['endDate'], '%Y-%m-%d')
    days = (end_date - start_date).days + 1
    print(days, "일 일정")
    # 거리 계산
    info = []
    for spot in data['spots']:
        lng = spot['geometry']['location']['lng']
        lat = spot['geometry']['location']['lat']
        # points.append(f"{lng},{lat}")

        region = reverse_geocode(lat, lng)
        print(f"🗺 {spot['name']}: {region['city']} {region['district']} {region['neighborhood']}")
        info.append({
            "spot": spot['name'],
            "city": region["city"],
            "district": region["district"],
            "neighborhood": region["neighborhood"]
        })

        time.sleep(1.1)  # Nominatim 요청 제한 준수

    print(info)

    spots = [
        {
            "name": spot["name"],
            "lat": spot["geometry"]["location"]["lat"],
            "lng": spot["geometry"]["location"]["lng"]
        }
        for spot in data["spots"]
    ]
    matrix = get_distance_matrix(spots)
    print(matrix)

    schedule = info_based_cluster_assignment(
        info,  # 행정구역 정보 포함된 리스트
        matrix,  # 거리행렬 (2D)
        data["startDate"],
        data["endDate"]
    )


    # schedule = distribute_must_spots_by_cluster(
    #     spots,
    #     data["startDate"],
    #     data["endDate"]
    # )
    print(schedule)

    return jsonify({"schedule": schedule})








if __name__ == "__main__":
    app.run(debug=True, port=5000)
