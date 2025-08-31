// 1) 배포 대비: 환경변수 우선
const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8084/api/bookmarklet';

const API_IMPROVE_URL =
    process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8084/api/bookmarklet/improve';

// AI 서버 URL 추가 (프록시를 사용하므로 실제로는 사용하지 않음)
const AI_SERVER_URL =
    process.env.NEXT_PUBLIC_AI_SERVER_URL || 'http://localhost:8000';

export interface ComplaintRequest {
    system: string;
    title: string;
    content: string;
    phone: string;
    email: string;
    isPublic: string;
    smsNotification: string;
}

export interface BookmarkletResponse {
    success: boolean;
    message: string;
    templateId: string;
    bookmarkletUrl: string;
    bookmarkletCode: string;
}

// AI 서버 관련 타입 추가
export interface AIRecommendRequest {
    issue: {
        summary: string;
    };
    channels: Array<{
        id: string;
        title: string;
    }>;
}

export interface AIRecommendResponse {
    options: Array<{
        id: string;
        title: string;
        reason: string;
    }>;
    recommendedChannel: string;
}

// (신규) 원샷 엔드포인트
export async function createBookmarklet(
    data: ComplaintRequest
): Promise<BookmarkletResponse> {
    const res = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

export async function improveComplaint(id: number): Promise<BookmarkletResponse> {
    const res = await fetch(`${API_IMPROVE_URL}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

// (기존) 구형 경로: 필요시 호환 유지
export async function generateBookmarklet(
    data: ComplaintRequest
): Promise<BookmarkletResponse> {
    const res = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

export async function getComplaints() {
    const res = await fetch(`${API_BASE_URL}/complaints`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

// AI 서버 채널 추천 API 추가 (프록시 사용)
export async function getAIRecommendation(summary: string): Promise<AIRecommendResponse> {
    const requestBody: AIRecommendRequest = {
        issue: { summary },
        channels: [
            { id: "safety_report", title: "안전신문고" },
            { id: "mayor_board", title: "구청장에게 바란다" },
            { id: "saeol", title: "동대문구 새올 전자민원창구" }
        ]
    };

    try {
        // Next.js API Route를 프록시로 사용 (CORS 우회)
        const res = await fetch('/api/ai/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
            throw new Error(`Proxy error: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error('AI 서버 연동 실패:', error);
        // 에러 시 기본값 반환
        return {
            options: [],
            recommendedChannel: "safety_report"
        };
    }
}


export async function fetchLegalBasisCandidates(params: {
    summary: string
    title: string
    max_count?: number
}) {
    const { summary, title, max_count = 7 } = params
    const res = await fetch('http://3.34.192.29:8000/api/legal-basis/candidates', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary, title, max_count }),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`법령 추천 API 오류: ${res.status} ${text}`)
    }
    return res.json()
}

// @/lib/api.ts에 추가
export async function generateComplaintContent(data: {
    situation: string;
    title: string;
    law: string;
}): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch('http://localhost:8000/process/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('AI 민원 내용 생성 실패');
    }

    if (!response.body) {
        throw new Error('스트림 응답을 받을 수 없습니다');
    }

    return response.body;
}

// frontend-server/lib/api.ts

export async function generateMayorDraft(payload: {
    summary: string;
    title: string;
    legal_basis: string[];
}) {
    const res = await fetch("http://localhost:8000/process/stream", {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Draft API error: ${res.status}`);
    }

    // 서버가 text/event-stream 스타일로 "data:" 라인을 흘려보내는 형태이므로 파싱
    const raw = await res.text();
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const dataLines = lines
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.replace(/^data:\s?/, ""));

    // "본문" 이후 라인만 우선 사용, 없으면 전체를 사용
    const bodyIdx = dataLines.findIndex((l) => l.includes("본문"));
    const picked = bodyIdx >= 0 ? dataLines.slice(bodyIdx + 1) : dataLines;

    return picked.join("\n").trim();
}