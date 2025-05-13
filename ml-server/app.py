from flask import Flask, request, jsonify
import pickle
import joblib
from flask_cors import CORS

# Flask 초기화
app = Flask(__name__)
CORS(app)


# 모델 로딩
vectorizer = joblib.load("model/vectorizer.pkl")
classifier = joblib.load("model/classifier.pkl")


@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json()
    print("data:", data)
    text = data.get("text", "")
    print(text)

    if not text.strip():
        return jsonify({"error": "text is required"}), 400

    # 벡터화 후 분류
    X = vectorizer.transform([text])
    print(X)
    prediction = classifier.predict(X)[0]
    print(prediction)
    return jsonify({"category": prediction})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
