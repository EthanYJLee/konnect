# categories.json (train_data.json)의 카테고리 키워드 기반 초기 모델 학습
import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# 데이터 로드
with open("/categories.json", "r", encoding="utf-8") as f:
    category_data = json.load(f)

texts = []
labels = []

for category, lang_dict in category_data.items():
    for lang, samples in lang_dict.items():
        for sentence in samples:
            texts.append(sentence)
            labels.append(category)

# TF-IDF 벡터화
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# Naive Bayes 분류기 학습
clf = MultinomialNB()
clf.fit(X, labels)

# 모델 저장
with open("models/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

with open("models/classifier.pkl", "wb") as f:
    pickle.dump(clf, f)

print("✅ 모델 학습 및 저장 완료")
