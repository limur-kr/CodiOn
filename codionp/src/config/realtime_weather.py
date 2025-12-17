# weather_recommender.py 파일에 추가 또는 별도 파일에 정의
import requests  # API 호출을 위한 라이브러리 (pip install requests 필요)
import json


def get_realtime_weather(latitude: float, longitude: float) -> dict:
    """
    외부 날씨 API (예: OpenWeatherMap)를 호출하여 실시간 데이터를 가져옵니다.
    """
    API_KEY = "cd63accc133fc76e1f94a3f270442688"  # 🚨 실제 API 키로 교체해야 합니다.
    BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

    params = {
        'lat': latitude,
        'lon': longitude,
        'appid': API_KEY,
        'units': 'metric',  # 단위를 섭씨(C)로 설정
        'lang': 'kr'
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()  # HTTP 오류가 있으면 예외 발생
        data = response.json()

        # API 응답에서 필요한 값들을 추출하여 recommend_fibre 함수의 형식에 맞게 변환
        weather_data = {
            # 기온, 체감 온도, 습도, 강수량(비/눈)을 추출
            'current_temp': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'feels_like': data['main']['feels_like'],
            # 강수량은 API 응답 구조에 따라 'rain' 또는 'snow'의 1h 또는 3h 값 사용
            'rain_volume': data.get('rain', {}).get('1h', 0.0) or data.get('snow', {}).get('1h', 0.0)
            # 'rain'이나 'snow' 키가 없으면 0.0으로 처리
        }

        return weather_data

    except requests.exceptions.RequestException as e:
        print(f"🚨 API 호출 오류 발생: {e}")
        return None
    except KeyError as e:
        print(f"🚨 API 응답 데이터 구조 오류: 필수 키 {e}가 없습니다.")
        return None