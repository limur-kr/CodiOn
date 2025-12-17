<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1KPDbqcAqaD59K-dGVeSffc7FqdTRN68E

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` (see `env.local.example`) and set `GEMINI_API_KEY` if you want to call Gemini directly from the frontend
3. Run the app:
   `npm run dev`

## n8n으로 Gemini 연동(권장)

프론트에 API 키를 두지 않기 위해, 이 프로젝트는 **n8n Webhook을 통해 Gemini를 호출**하도록 설정할 수 있습니다.

1. n8n 실행
   - 로컬 설치/실행 방식은 환경마다 다릅니다. (Docker 또는 `npx n8n` 등)
2. n8n에서 워크플로우 생성
   - **Webhook** 노드(POST)로 요청을 받습니다.
   - Webhook 입력 예시:
     - `analyze-clothing`: `{ "imageBase64": "...(dataURL/base64)...", "prompt": "..." }`
     - `generate-outfit`: `{ "weather": {...}, "closet": [...], "prompt": "..." }`
   - 마지막에 **Respond to Webhook**(또는 Webhook 응답 모드)으로 프론트에 JSON을 반환합니다.
3. 프론트 환경변수 설정
   - `env.local.example`를 참고해 `.env.local`에 아래 값을 넣습니다:
     - `VITE_N8N_ANALYZE_IMAGE_WEBHOOK_URL`
     - `VITE_N8N_OUTFIT_WEBHOOK_URL`
     - (테스트 화면용) `VITE_N8N_IMAGE_ANALYZER_WEBHOOK_URL`
4. CORS 주의
   - 브라우저에서 n8n으로 요청하므로, n8n에서 `http://localhost:3000`(이 프로젝트 dev 서버) Origin을 허용해야 합니다.
