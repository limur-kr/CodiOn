from google import genai

# 🚨 일회성 테스트용: 여기에 새로 발급받은 키를 직접 넣어보세요.
TEST_API_KEY = "AIzaSyBG8MG2huTTEIoxwT7e51C0tXrvp7r4r-A"

if __name__ == '__main__':
    # 키를 명시적으로 전달합니다.
    client = genai.Client(api_key=TEST_API_KEY)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Explain how AI works in a few words"
        )
        print(response.text)
    except Exception as e:
        print(f"오류 발생: {e}")