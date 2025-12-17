import pandas as pd

# 33가지 소재에 대한 날씨 매핑 데이터
# temp_min : 착용 권장 최저 기온
# temp_max : 착용 권장 최고 기온
# rain_ok : 비오는 날 착용 적합 여부(0: 비추 / 1: 보통 / 2: 추천or방수)
# humidity_limit : 습도가 높을 때(70% 이상) 적합 여부 (Ture : 쾌적 , False : 꿉꿉함/변형 위험)
fibre_weather_db = {
    0:  {'name': 'abaca',              'kor': '아바카',      'temp_min': 20, 'temp_max': 40, 'rain_ok': 1, 'humidity_limit': True,  'desc': '통기성이 매우 좋고 거친 식물성 섬유로 무더운 여름에 적합'},
    1:  {'name': 'acrylic',            'kor': '아크릴',      'temp_min': -5, 'temp_max': 15, 'rain_ok': 1, 'humidity_limit': False, 'desc': '울 대용 합성섬유로 보온성이 좋으나 통기성이 낮아 더운 날 비추천'},
    2:  {'name': 'alpaca',             'kor': '알파카',      'temp_min': -15,'temp_max': 10, 'rain_ok': 0, 'humidity_limit': False, 'desc': '보온성이 매우 뛰어나고 가벼움. 한파에 적합하나 습기에 약함'},
    3:  {'name': 'angora',             'kor': '앙고라',      'temp_min': -10,'temp_max': 10, 'rain_ok': 0, 'humidity_limit': False, 'desc': '털이 길고 부드러워 보온성이 좋음. 물에 젖으면 털이 뭉치므로 비 오는 날 금지'},
    4:  {'name': 'aramid',             'kor': '아라미드',    'temp_min': -20,'temp_max': 40, 'rain_ok': 2, 'humidity_limit': True,  'desc': '특수/기능성 소재(방탄/내열). 날씨 영향보다는 내구성이 필요할 때 사용'},
    5:  {'name': 'camel',              'kor': '캐멀(낙타털)', 'temp_min': -10,'temp_max': 12, 'rain_ok': 0, 'humidity_limit': False, 'desc': '천연 단열재 역할을 하여 일교차가 큰 쌀쌀한 날씨에 적합'},
    6:  {'name': 'cashmere',           'kor': '캐시미어',    'temp_min': -10,'temp_max': 13, 'rain_ok': 0, 'humidity_limit': False, 'desc': '가볍고 따뜻하지만 물과 습기에 매우 취약함. 맑고 추운 날 추천'},
    7:  {'name': 'cotton',             'kor': '면',          'temp_min': 15, 'temp_max': 35, 'rain_ok': 0, 'humidity_limit': True,  'desc': '흡습성이 좋아 여름에 좋지만, 젖으면 잘 마르지 않아 비 오는 날은 피하는 게 좋음'},
    8:  {'name': 'cupro',              'kor': '큐프라',      'temp_min': 15, 'temp_max': 30, 'rain_ok': 0, 'humidity_limit': True,  'desc': '실크와 유사한 촉감에 정전기가 적음. 봄/가을/초여름에 적합'},
    9:  {'name': 'elastane_spandex',   'kor': '스판덱스',    'temp_min': 10, 'temp_max': 30, 'rain_ok': 1, 'humidity_limit': True,  'desc': '활동성이 필요한 날 적합. 단독 소재보다는 혼방으로 쓰임'},
    10: {'name': 'flax_linen',         'kor': '리넨(마)',    'temp_min': 22, 'temp_max': 40, 'rain_ok': 1, 'humidity_limit': True,  'desc': '최고의 여름 소재. 땀 배출이 빠르고 시원함. 구김이 잘 감'},
    11: {'name': 'fur',                'kor': '모피',        'temp_min': -30,'temp_max': 5,  'rain_ok': 0, 'humidity_limit': False, 'desc': '극한의 추위에 적합. 눈이나 비에 젖으면 손상 위험이 큼'},
    12: {'name': 'hemp',               'kor': '대마',        'temp_min': 20, 'temp_max': 38, 'rain_ok': 1, 'humidity_limit': True,  'desc': '리넨보다 거칠지만 통기성이 매우 우수함. 고온 다습한 날씨에 추천'},
    13: {'name': 'horse_hair',         'kor': '말총',        'temp_min': 10, 'temp_max': 25, 'rain_ok': 1, 'humidity_limit': True,  'desc': '주로 옷의 심지나 장식에 쓰임. 빳빳한 질감으로 형태 유지에 좋음'},
    14: {'name': 'jute',               'kor': '황마',        'temp_min': 20, 'temp_max': 35, 'rain_ok': 1, 'humidity_limit': True,  'desc': '매우 거친 식물성 섬유. 의류보다는 가방/소품에 쓰임. 여름 느낌'},
    15: {'name': 'leather',            'kor': '가죽',        'temp_min': 0,  'temp_max': 20, 'rain_ok': 0, 'humidity_limit': False, 'desc': '방풍 효과가 좋아 바람 부는 쌀쌀한 날 좋음. 물과 땀(습도)에 쥐약'},
    16: {'name': 'llama',              'kor': '라마',        'temp_min': -10,'temp_max': 10, 'rain_ok': 0, 'humidity_limit': False, 'desc': '알파카와 유사하게 보온성이 뛰어남. 추운 날씨용'},
    17: {'name': 'lyocell',            'kor': '리오셀',      'temp_min': 18, 'temp_max': 32, 'rain_ok': 1, 'humidity_limit': True,  'desc': '흡습속건이 뛰어나고 찰랑거림. 덥고 습한 날씨에 매우 적합'},
    18: {'name': 'milk_fiber',         'kor': '우유섬유',    'temp_min': 15, 'temp_max': 28, 'rain_ok': 0, 'humidity_limit': True,  'desc': '보습성이 있고 부드러움. 건조한 봄/가을 날씨에 피부 보호용으로 좋음'},
    19: {'name': 'modal',              'kor': '모달',        'temp_min': 15, 'temp_max': 30, 'rain_ok': 0, 'humidity_limit': True,  'desc': '면보다 부드럽고 흡수성이 좋음. 피부에 닿는 느낌이 좋아 이너웨어로 적합'},
    20: {'name': 'mohair',             'kor': '모헤어',      'temp_min': -5, 'temp_max': 15, 'rain_ok': 0, 'humidity_limit': False, 'desc': '광택이 있고 가벼운 털. 습기에 민감하여 맑고 서늘한 날 추천'},
    21: {'name': 'nylon',              'kor': '나일론',      'temp_min': 5,  'temp_max': 25, 'rain_ok': 2, 'humidity_limit': False, 'desc': '바람막이 소재. 방풍/방수 효과가 있어 비 오거나 바람 부는 날 추천'},
    22: {'name': 'polyester',          'kor': '폴리에스터',  'temp_min': 5,  'temp_max': 30, 'rain_ok': 2, 'humidity_limit': False, 'desc': '빨리 마르고 내구성이 좋음. 운동복이나 우비 등 전천후 사용 가능'},
    23: {'name': 'polyolefin',         'kor': '폴리올레핀',  'temp_min': 0,  'temp_max': 25, 'rain_ok': 2, 'humidity_limit': True,  'desc': '물에 뜨고 젖지 않음. 땀 배출이 필요한 운동 시 적합'},
    24: {'name': 'ramie',              'kor': '모시',        'temp_min': 24, 'temp_max': 40, 'rain_ok': 1, 'humidity_limit': True,  'desc': '한국의 여름 소재. 까슬까슬하여 피부에 달라붙지 않음. 폭염에 추천'},
    25: {'name': 'silk',               'kor': '실크',        'temp_min': 15, 'temp_max': 28, 'rain_ok': 0, 'humidity_limit': False, 'desc': '온도 조절 능력이 있으나 땀과 물에 매우 약함. 맑고 온화한 날씨용'},
    26: {'name': 'sisal',              'kor': '사이잘',      'temp_min': 20, 'temp_max': 35, 'rain_ok': 1, 'humidity_limit': True,  'desc': '매우 거친 섬유. 여름용 모자나 가방 소재로 적합'},
    27: {'name': 'soybean_fiber',      'kor': '콩섬유',      'temp_min': 15, 'temp_max': 30, 'rain_ok': 0, 'humidity_limit': True,  'desc': '식물성 캐시미어라 불림. 통기성이 좋고 항균 기능이 있어 따뜻한 날 적합'},
    28: {'name': 'suede',              'kor': '스웨이드',    'temp_min': 5,  'temp_max': 18, 'rain_ok': 0, 'humidity_limit': False, 'desc': '물에 젖으면 얼룩이 심하게 남음. 비 오는 날 절대 금지. 서늘하고 건조한 날'},
    29: {'name': 'triacetate_acetate', 'kor': '아세테이트',  'temp_min': 15, 'temp_max': 28, 'rain_ok': 0, 'humidity_limit': False, 'desc': '실크 대용 안감. 흡습성이 낮아 땀이 많이 나는 날은 피하는 게 좋음'},
    30: {'name': 'viscose_rayon',      'kor': '레이온(인견)', 'temp_min': 20, 'temp_max': 35, 'rain_ok': 0, 'humidity_limit': True,  'desc': '냉감 소재(인견). 몸에 닿으면 시원하나 물에 젖으면 강도가 약해짐'},
    31: {'name': 'wool',               'kor': '울(양모)',    'temp_min': -10,'temp_max': 15, 'rain_ok': 1, 'humidity_limit': True,  'desc': '보온성과 통기성을 모두 갖춤. 약간의 비는 튕겨내지만 습한 여름엔 부적합'},
    32: {'name': 'yak',                'kor': '야크',        'temp_min': -20,'temp_max': 10, 'rain_ok': 1, 'humidity_limit': True,  'desc': '캐시미어보다 튼튼하고 보온성이 뛰어남. 한파에 적합'}
}

# 데이터프레임으로 변환 (보기 편하게)
df_fabric_weather = pd.DataFrame.from_dict(fibre_weather_db, orient='index')
print(df_fabric_weather.head())