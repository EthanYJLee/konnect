# 실제 사용자 데이터 기반 재학습
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle

# 학습 데이터 불러오기
with open("models/train_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [item["text"] for item in data]
labels = [item["category"] for item in data]

# TF-IDF + Naive Bayes 파이프라인 생성
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=1000)),
    ("nb", MultinomialNB())
])

# 모델 학습
pipeline.fit(texts, labels)

# 예시 평가 (선택사항)
X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred))

# 개별 저장
joblib.dump(pipeline.named_steps["tfidf"], "models/vectorizer.pkl")
joblib.dump(pipeline.named_steps["nb"], "models/classifier.pkl")

print("✅ vectorizer.pkl, classifier.pkl 저장 완료")
