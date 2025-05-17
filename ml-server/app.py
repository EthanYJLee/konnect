from flask import Flask, request, jsonify
import pickle
import joblib
from flask_cors import CORS
from datetime import datetime, timedelta
import requests
from utils.schedule_utils import distribute_must_spots_by_cluster


# Flask 초기화
app = Flask(__name__)
CORS(app)


# 모델 로딩
vectorizer = joblib.load("models/vectorizer.pkl")
classifier = joblib.load("models/classifier.pkl")


@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json()
    # print("data:", data)
    text = data.get("text", "")
    # print(text)

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
    print(data)
    # 1. 날짜 계산
    start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
    end_date = datetime.strptime(data['endDate'], '%Y-%m-%d')
    days = (end_date - start_date).days + 1
    print(days, "일 일정")
    # 2. 거리 계산
    points = []
    for spot in data['spots']:
        lng = spot['geometry']['location']['lng']
        lat = spot['geometry']['location']['lat']
        points.append(f"{lng},{lat}")

    # simplified_spots = simplify_spots(data["spots"])
    # print(simplified_spots)
    #
    # url = "http://175.125.92.35:5010/route/v1/driving/" + ";".join(points) + "?overview=false"
    # print(url)
    # try:
    #     res = requests.get(url)
    #     if res.ok:
    #         data = res.json()
    #         print(data)
    #         print(data["routes"][0]["distance"], data["routes"][0]["duration"])
    #
    # except Exception as e:
    #     print("OSRM Error:", e)

    spots = [
        {
            "name": spot["name"],
            "lat": spot["geometry"]["location"]["lat"],
            "lng": spot["geometry"]["location"]["lng"]
        }
        for spot in data["spots"]
    ]

    schedule = distribute_must_spots_by_cluster(
        spots,
        data["startDate"],
        data["endDate"]
    )

    return jsonify({"schedule": schedule})


def distribute_must_spots(must_spots, start_date, end_date):
    date_list = []
    cur = start_date
    while cur <= end_date:
        date_list.append(cur.strftime("%Y-%m-%d"))
        cur += timedelta(days=1)

    result = {date: [] for date in date_list}
    day_idx = 0

    for spot in must_spots:
        # 하루 최대 2개까지 배치
        while len(result[date_list[day_idx]]) >= 2:
            day_idx = (day_idx + 1) % len(date_list)
        result[date_list[day_idx]].append(spot)
        day_idx = (day_idx + 1) % len(date_list)

    return result


def simplify_spots(raw_spots):
    return [
        {
            "name": spot["name"],
            "lat": spot["geometry"]["location"]["lat"],
            "lng": spot["geometry"]["location"]["lng"]
        }
        for spot in raw_spots
    ]





if __name__ == "__main__":
    app.run(debug=True, port=5000)
