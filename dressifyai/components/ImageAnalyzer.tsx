import React, { useMemo, useState } from 'react';
import Button from './Button';
import type { GeminiResponse } from '../types/gemini';
import { callN8NWebhook } from '../services/n8nService';

type Env = {
  VITE_N8N_IMAGE_ANALYZER_WEBHOOK_URL?: string;
};

const env = (import.meta as any).env as Env | undefined;

const ImageAnalyzer: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('이 이미지를 분석해서 한글로 설명해줘');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const webhookUrl = useMemo(() => env?.VITE_N8N_IMAGE_ANALYZER_WEBHOOK_URL?.trim(), []);

  const analyzeImage = async () => {
    if (!webhookUrl) {
      alert('VITE_N8N_IMAGE_ANALYZER_WEBHOOK_URL 환경변수를 먼저 설정하세요.');
      return;
    }
    if (!imageUrl.trim()) {
      alert('이미지 URL을 입력하세요!');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const data = await callN8NWebhook<GeminiResponse>(webhookUrl, {
        imageUrl: imageUrl.trim(),
        prompt: prompt.trim(),
      });

      setResult((data?.text as string) || '분석 결과를 가져오지 못했습니다.');
    } catch (error) {
      console.error('Error:', error);
      setResult('에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-[#7C73E6]">n8n + Gemini 연동 테스트</h1>
        <p className="text-[#C4C1E0] mt-2 text-lg">
          프론트 → n8n Webhook → Gemini → 프론트 응답 흐름이 정상인지 확인합니다.
        </p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0] space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#7C73E6] uppercase tracking-wider">
            이미지 URL
          </label>
          <input
            type="text"
            placeholder="예: https://.../image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#C4C1E0] focus:ring-2 focus:ring-[#7C73E6] focus:border-transparent bg-white text-[#7C73E6]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#7C73E6] uppercase tracking-wider">
            프롬프트
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#C4C1E0] focus:ring-2 focus:ring-[#7C73E6] focus:border-transparent bg-white text-[#7C73E6]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={analyzeImage} isLoading={loading}>
            {loading ? '분석 중...' : '이미지 분석하기'}
          </Button>
          <span className="text-xs text-[#C4C1E0]">
            Webhook: {webhookUrl ? webhookUrl : '(미설정)'}
          </span>
        </div>
      </div>

      <div className="bg-[#FAFAFA] p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
        <h2 className="font-bold text-[#7C73E6] mb-3">결과</h2>
        <div className="whitespace-pre-wrap text-sm text-slate-700 min-h-[120px]">
          {result || <span className="text-[#C4C1E0]">여기에 Gemini 응답 텍스트가 표시됩니다.</span>}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;



