import json

with open("model/categories.json", "r", encoding="utf-8") as f:
    raw = json.load(f)

converted = []

for category, langs in raw.items():
    for lang_keywords in langs.values():
        for kw in lang_keywords:
            converted.append({"text": kw, "category": category})

# 저장
with open("model/train_data.json", "w", encoding="utf-8") as f:
    json.dump(converted, f, ensure_ascii=False, indent=2)

print(f"✅ {len(converted)}개의 학습 샘플 저장됨.")
