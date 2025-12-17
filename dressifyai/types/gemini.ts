export interface GeminiResponse {
  /** Gemini가 분석한 결과 텍스트 */
  text: string;
  /** n8n 워크플로우에 따라 필요한 추가 필드를 확장해서 쓰세요 */
  [key: string]: unknown;
}



