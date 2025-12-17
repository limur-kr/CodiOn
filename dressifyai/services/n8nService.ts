export type N8NWebhookResult<T> = T | T[] | { data: T } | { data: T[] };

function unwrapN8NResult<T>(raw: N8NWebhookResult<T>): T {
  // Common n8n patterns:
  // - direct object: { ... }
  // - array of items: [ { ... } ]
  // - wrapped: { data: { ... } } or { data: [ ... ] }
  if (Array.isArray(raw)) return raw[0] as T;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const d = (raw as any).data;
    return Array.isArray(d) ? (d[0] as T) : (d as T);
  }
  return raw as T;
}

export async function callN8NWebhook<TResponse>(
  webhookUrl: string,
  payload: unknown,
  options?: { timeoutMs?: number }
): Promise<TResponse> {
  const timeoutMs = options?.timeoutMs ?? 60_000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // 👇 여기부터 수정 (응답이 JSON인지 확인하는 로직 추가)
    const contentType = res.headers.get("content-type");
    const text = await res.text();

    if (!res.ok) {
        throw new Error(`n8n webhook failed (${res.status}): ${text || res.statusText}`);
    }

    // JSON 형식이면 파싱하고, 아니면 텍스트를 객체로 감싸서 반환
    let json;
    try {
        json = text ? JSON.parse(text) : {};
    } catch (e) {
        // JSON 파싱 실패 시 (단순 텍스트 응답일 경우)
        console.warn("응답이 JSON이 아닙니다. 텍스트로 처리합니다.");
        return { text: text } as unknown as TResponse;
    }

    return unwrapN8NResult<TResponse>(json);

    // const text = await res.text();
    // if (!res.ok) {
    //   throw new Error(`n8n webhook failed (${res.status}): ${text || res.statusText}`);
    // }
    //
    // const json = text ? (JSON.parse(text) as N8NWebhookResult<TResponse>) : ({} as any);
    // return unwrapN8NResult<TResponse>(json);
  } finally {
    clearTimeout(t);
  }
}



