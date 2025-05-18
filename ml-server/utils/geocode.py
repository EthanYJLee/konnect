import requests

def reverse_geocode(lat, lon):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "k-life-itinerary-script"
    }

    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)
        res.raise_for_status()
        data = res.json().get("address", {})
        return {
            "city": data.get("city") or data.get("state") or "",
            "district": data.get("borough") or "",
            "neighborhood": data.get("suburb") or data.get("town") or ""
        }
    except Exception as e:
        print(f"[ERROR] Geocoding ({lat}, {lon}):", e)
        return {"city": "", "district": "", "neighborhood": ""}
