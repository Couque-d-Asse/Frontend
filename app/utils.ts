import type { SituationAnalysis } from './types'
import { VIOLATION_TYPE_KEYWORDS } from './constants'
import { getAIRecommendation } from '@/lib/api'

export const analyzeSituation = async (situation: string): Promise<SituationAnalysis> => {
    try {
        // lib/api.ts의 AI 추천 함수 사용
        const data = await getAIRecommendation(situation)

        // AI 서버 응답을 기반으로 서비스 결정
        let service = "안전신문고"
        let reason = "교통 및 안전 관련 신고는 안전신문고에서 처리됩니다."
        let violationType = "교통위반(고속도로 포함)"

        if (data.recommendedChannel) {
            switch (data.recommendedChannel) {
                case "safety_report":
                    service = "안전신문고"
                    break
                case "mayor_board":
                    service = "구청장에게 바란다"
                    break
                case "saeol":
                    service = "동대문구 새올 전자민원창구"
                    break
            }
        }

        // AI 추천 이유가 있으면 사용
        if (data.options && data.options.length > 0) {
            const recommended = data.options.find((opt) => opt.id === data.recommendedChannel)
            if (recommended && recommended.reason) {
                reason = recommended.reason
            }
        }

        // 위반 유형 결정 (안전신문고인 경우)
        if (service === "안전신문고") {
            violationType = determineViolationType(situation)
        }

        return {
            service,
            reason,
            violationType,
            aiRecommendation: data // AI 서버의 원본 응답도 포함
        }

    } catch (error) {
        console.error('AI 서버 연동 실패, 로컬 분석으로 폴백:', error)
        // AI 서버 실패 시 기존 로컬 분석 로직 사용
        return analyzeSituationLocal(situation)
    }
}

// 위반 유형 결정 함수
function determineViolationType(situation: string): string {
    const input = situation.toLowerCase()
    let bestMatch = "교통위반(고속도로 포함)"
    let maxScore = 0

    for (const [violationType, keywords] of Object.entries(VIOLATION_TYPE_KEYWORDS)) {
        const score = keywords.filter(keyword => input.includes(keyword)).length
        if (score > maxScore) {
            maxScore = score
            bestMatch = violationType
        }
    }

    return bestMatch
}

// 기존 로컬 분석 로직 (폴백용)
export const analyzeSituationLocal = (situation: string): SituationAnalysis => {
    const input = situation.toLowerCase()

    // 가장 적합한 신고 유형 찾기
    const violationType = determineViolationType(situation)

    // 기본 서비스 분석
    const safetyKeywords = [
        "불법주차", "주차위반", "교통위반", "신호위반", "과속", "난폭운전",
        "보행자", "횡단보도", "안전", "사고", "위험", "교통", "차량",
        "운전", "도로", "포트홀", "신호등", "표지판", "가드레일",
    ]

    const dongdaemunKeywords = [
        "소음", "악취", "쓰레기", "환경", "위생", "건축", "공사",
        "상가", "시설물", "가로등", "공원", "놀이터", "복지", "민원",
    ]

    const seoulKeywords = ["서울시", "지하철", "버스", "대중교통", "시정", "정책", "제안"]

    let service = "안전신문고"
    let reason = "교통 및 안전 관련 신고는 안전신문고에서 처리됩니다."

    if (dongdaemunKeywords.some((keyword) => input.includes(keyword))) {
        service = "동대문구 새올 전자민원창구"
        reason = "동대문구 관할 생활민원은 새올 전자민원창구에서 처리됩니다."
    } else if (seoulKeywords.some((keyword) => input.includes(keyword))) {
        service = "구청장에게 바란다"
        reason = "서울시 전체 관련 민원은 응답소에서 처리됩니다."
    }

    return {
        service,
        reason,
        violationType
    }
}

export const canUseClipboard = () => {
    return typeof window !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        (window.isSecureContext ?? false) &&
        !!(navigator as any).clipboard &&
        typeof (navigator as any).clipboard.writeText === 'function'
}

export const copyText = async (text: string) => {
    try {
        if (canUseClipboard()) {
            await (navigator as any).clipboard.writeText(text)
        } else {
            // Fallback for non-secure contexts or missing API
            const ta = document.createElement('textarea')
            ta.value = text
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.focus()
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
        }
        alert('복사되었습니다.')
    } catch (e) {
        console.error('클립보드 복사 실패:', e)
        alert('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.')
    }
}

export const mapToApiPayload = (formData: any) => {
    return {
        system: "DDM",
        title: formData.title,
        content: formData.content,
        phone: formData.phone || formData.phoneNumber,
        email: formData.email,
        isPublic: formData.publicStatus === "공개" ? "Y" : "N",
        smsNotification:
            formData.notificationMethod === "신청" ||
                formData.notificationMethod === "휴대전화 문자메시지(SMS)"
                ? "Y"
                : "N",
    }
}

